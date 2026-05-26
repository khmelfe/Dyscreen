import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String _samplePromptText =
    'הטכנולוגיה המודרנית משנה את הדרך שבה אנו לומדים ומתקשרים זה עם זה בכל יום. בעזרת מחשבים וטלפונים חכמים, אפשר למצוא מידע במהירות, לכתוב סיפורים מעניינים ולשתף תמונות עם חברים רחוקים. למרות השינויים הרבים, חשוב מאוד להמשיך לתרגל גם כתיבה ביד, כיוון שהיא עוזרת לנו לפתח את המחשבה, הזיכרון והיצירתיות שלנו. ';
const String _drawingInstructionsText =
    'Use the tablet pen only. Copy the text below exactly as shown, then tap Use sample.';

void main() {
  runApp(const DyscreenApp());
}

class DyscreenApp extends StatelessWidget {
  const DyscreenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DyScreen',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF635BFF),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF080817),
        fontFamily: Platform.isIOS ? 'SF Pro Display' : null,
      ),
      home: const DyscreenHomePage(),
    );
  }
}

class DyscreenHomePage extends StatefulWidget {
  const DyscreenHomePage({super.key});

  @override
  State<DyscreenHomePage> createState() => _DyscreenHomePageState();
}

class _DyscreenHomePageState extends State<DyscreenHomePage>
    with SingleTickerProviderStateMixin {
  late final TextEditingController _apiBaseController;
  late final AnimationController _backgroundController;
  PlatformFile? _selectedFile;
  AnalysisResult? _result;
  bool _isUploading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _apiBaseController = TextEditingController(text: _defaultApiBaseUrl());
    _backgroundController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 24),
    )..repeat();
  }

  @override
  void dispose() {
    _backgroundController.dispose();
    _apiBaseController.dispose();
    super.dispose();
  }

  String _defaultApiBaseUrl() {
    if (Platform.isAndroid) {
      return 'http://192.168.10.102:8000';
    }
    return 'http://192.168.10.102:8000';
  }

  Future<void> _pickFile() async {
    setState(() {
      _error = null;
    });

    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['png', 'jpg', 'jpeg', 'pdf'],
      withData: false,
    );

    if (result == null || result.files.isEmpty) {
      return;
    }

    setState(() {
      _selectedFile = result.files.single;
      _result = null;
    });
  }

  Future<void> _drawSample() async {
    setState(() {
      _error = null;
    });

    final drawnFile = await Navigator.of(context).push<PlatformFile>(
      MaterialPageRoute(
        builder: (_) => const _DrawingSamplePage(promptText: _samplePromptText),
      ),
    );

    if (drawnFile == null) {
      return;
    }

    setState(() {
      _selectedFile = drawnFile;
      _result = null;
    });
  }

  Future<void> _submitFile() async {
    final file = _selectedFile;
    final path = file?.path;

    if (file == null || path == null) {
      setState(() {
        _error = 'Choose a handwriting sample first.';
      });
      return;
    }

    final apiBase = _apiBaseController.text.trim().replaceAll(
      RegExp(r'/+$'),
      '',
    );
    final uri = Uri.parse('$apiBase/upload_file');

    setState(() {
      _isUploading = true;
      _error = null;
    });

    try {
      final request = http.MultipartRequest('POST', uri);
      request.files.add(await http.MultipartFile.fromPath('myfile', path));

      final streamedResponse = await request.send().timeout(
        const Duration(seconds: 90),
      );
      final response = await http.Response.fromStream(streamedResponse);
      final body = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw UploadException(
          body['error']?.toString() ??
              body['details']?.toString() ??
              'Upload failed.',
        );
      }

      setState(() {
        _result = AnalysisResult.fromJson(body);
      });
    } on FormatException {
      setState(() {
        _error = 'The server returned an unreadable response.';
      });
    } on SocketException {
      setState(() {
        _error = 'Could not reach the API. Check the host address and server.';
      });
    } on UploadException catch (err) {
      setState(() {
        _error = err.message;
      });
    } catch (err) {
      setState(() {
        _error = 'Analysis failed: $err';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  void _reset() {
    setState(() {
      _selectedFile = null;
      _result = null;
      _error = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: _AnimatedShapeGrid(animation: _backgroundController),
          ),
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 900;
                return CustomScrollView(
                  slivers: [
                    SliverPadding(
                      padding: EdgeInsets.symmetric(
                        horizontal: isWide ? 48 : 20,
                        vertical: isWide ? 34 : 20,
                      ),
                      sliver: SliverToBoxAdapter(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 1280),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const _AppHeader(),
                              SizedBox(height: isWide ? 32 : 22),
                              if (_result == null)
                                _UploadSurface(
                                  isWide: isWide,
                                  selectedFile: _selectedFile,
                                  apiBaseController: _apiBaseController,
                                  isUploading: _isUploading,
                                  error: _error,
                                  onPickFile: _pickFile,
                                  onDrawSample: _drawSample,
                                  onSubmit: _submitFile,
                                )
                              else
                                _ResultsSurface(
                                  isWide: isWide,
                                  result: _result!,
                                  onReset: _reset,
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedShapeGrid extends StatelessWidget {
  const _AnimatedShapeGrid({required this.animation});

  final Animation<double> animation;

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: AnimatedBuilder(
        animation: animation,
        builder: (context, _) {
          return CustomPaint(
            painter: _ShapeGridPainter(progress: animation.value),
            size: Size.infinite,
          );
        },
      ),
    );
  }
}

class _ShapeGridPainter extends CustomPainter {
  const _ShapeGridPainter({required this.progress});

  final double progress;

  static const double _hexSize = 40;
  static const Color _baseColor = Color(0xFF060010);
  static const Color _lineColor = Color(0x7C242860);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = _baseColor);

    final hexHoriz = _hexSize * 1.5;
    final hexVert = _hexSize * math.sqrt(3);
    final offsetDistance = progress * hexHoriz * 2;
    final offsetX = (-offsetDistance) % (hexHoriz * 2);
    final offsetY = (-progress * hexVert) % hexVert;
    final colShift = (offsetDistance / hexHoriz).floor();
    final cols = (size.width / hexHoriz).ceil() + 4;
    final rows = (size.height / hexVert).ceil() + 4;
    final stroke = Paint()
      ..color = _lineColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (var col = -2; col < cols; col++) {
      for (var row = -2; row < rows; row++) {
        final cx = col * hexHoriz + offsetX;
        final cy =
            row * hexVert +
            ((col + colShift).isOdd ? hexVert / 2 : 0) +
            offsetY;
        canvas.drawPath(_hexPath(Offset(cx, cy)), stroke);
      }
    }

    final vignette = Paint()
      ..shader = ui.Gradient.radial(
        Offset(size.width / 2, size.height / 2),
        math.sqrt(size.width * size.width + size.height * size.height) / 2,
        const [Color(0x00000000), Color(0x33000000)],
      );
    canvas.drawRect(Offset.zero & size, vignette);
  }

  Path _hexPath(Offset center) {
    final path = Path();
    for (var i = 0; i < 6; i++) {
      final angle = math.pi / 3 * i;
      final point = Offset(
        center.dx + _hexSize * math.cos(angle),
        center.dy + _hexSize * math.sin(angle),
      );
      if (i == 0) {
        path.moveTo(point.dx, point.dy);
      } else {
        path.lineTo(point.dx, point.dy);
      }
    }
    return path..close();
  }

  @override
  bool shouldRepaint(covariant _ShapeGridPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

class _AppHeader extends StatelessWidget {
  const _AppHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      // children: [
      //   Container(
      //     width: 48,
      //     height: 48,
      //     decoration: BoxDecoration(
      //       color: const Color(0xFF635BFF),
      //       borderRadius: BorderRadius.circular(8),
      //       boxShadow: const [
      //         BoxShadow(
      //           color: Color(0x552E28C6),
      //           blurRadius: 24,
      //           offset: Offset(0, 12),
      //         ),
      //       ],
      //     ),
      //     child: const Icon(Icons.subject_rounded, color: Colors.white),
      //   ),
      //   const SizedBox(width: 14),
      //   const Column(
      //     crossAxisAlignment: CrossAxisAlignment.start,
      //     children: [
      //       Text(
      //         'DyScreen',
      //         style: TextStyle(
      //           fontSize: 28,
      //           fontWeight: FontWeight.w800,
      //           letterSpacing: 0,
      //         ),
      //       ),
      //       SizedBox(height: 2),
      //       Text(
      //         'Handwriting screening for tablet workflows',
      //         style: TextStyle(color: Color(0xFFB9C0D7), fontSize: 14),
      //       ),
      //     ],
      //   ),
      // ],
    );
  }
}

class _UploadSurface extends StatelessWidget {
  const _UploadSurface({
    required this.isWide,
    required this.selectedFile,
    required this.apiBaseController,
    required this.isUploading,
    required this.error,
    required this.onPickFile,
    required this.onDrawSample,
    required this.onSubmit,
  });

  final bool isWide;
  final PlatformFile? selectedFile;
  final TextEditingController apiBaseController;
  final bool isUploading;
  final String? error;
  final VoidCallback onPickFile;
  final VoidCallback onDrawSample;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final intro = _GlassPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            'Welcome to DyScreen',
            style: TextStyle(
              fontSize: 45,
              fontWeight: FontWeight.w800,
              letterSpacing: 0,
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            """We utilize advanced Deep Learning models to help identify learning differences across all age groups.
Early screening is the first step toward personalized support and academic success.

Steps:
Prepare your file: Take a clear photo or scan of a handwritten Hebrew sample.
Upload: Click the button below to upload your PDF or Image (JPG/PNG).
Analyze: Our model will process the sample to provide instant feedback.

""",
            style: TextStyle(
              color: Color(0xFFDDE2F2),

              fontSize: 20,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: const [
              _StepPill(icon: Icons.document_scanner_rounded, text: 'Prepare'),
              _StepPill(icon: Icons.cloud_upload_rounded, text: 'Upload'),
              _StepPill(icon: Icons.analytics_rounded, text: 'Analyze'),
            ],
          ),
        ],
      ),
    );

    final controls = _GlassPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            'Sample upload',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w400),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: apiBaseController,
            decoration: InputDecoration(
              labelText: 'API host',
              hintText: 'http://127.0.0.1:8000',
              prefixIcon: const Icon(Icons.dns_rounded),
              filled: true,
              fillColor: const Color(0x1AFFFFFF),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0x334D5B86)),
              ),
            ),
          ),
          const SizedBox(height: 8),
          _SelectedFileTile(file: selectedFile),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: isUploading ? null : onPickFile,
                  icon: const Icon(Icons.attach_file_rounded),
                  label: const Text('Choose file'),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF04AA6D),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(58),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton.icon(
                  onPressed: isUploading ? null : onDrawSample,
                  icon: const Icon(Icons.draw_rounded),
                  label: const Text('Draw sample'),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF2F7DF6),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(58),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: isUploading ? null : onSubmit,
            icon: isUploading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.play_arrow_rounded),
            label: Text(isUploading ? 'Analyzing...' : 'Submit'),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF635BFF),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(58),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          if (error != null) ...[
            const SizedBox(height: 16),
            _ErrorBanner(message: error!),
          ],
        ],
      ),
    );

    if (isWide) {
      return Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              intro,
              const SizedBox(height: 18),
              controls,
              const SizedBox(height: 18),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        intro,
        const SizedBox(height: 8),
        controls,
        const SizedBox(height: 8),
      ],
    );
  }
}

class _ResultsSurface extends StatelessWidget {
  const _ResultsSurface({
    required this.isWide,
    required this.result,
    required this.onReset,
  });

  final bool isWide;
  final AnalysisResult result;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    final details = _GlassPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Analysis Complete',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 20),
          _ResultBadge(result: result),
          const SizedBox(height: 22),
          _LikelihoodBar(probability: result.probabilityPercent),
          const SizedBox(height: 24),
          _MetricGrid(features: result.features),
          const SizedBox(height: 10),
          FilledButton.icon(
            onPressed: onReset,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Scan another sample'),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF04AA6D),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(56),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );

    final images = _GlassPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Feature selection',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 21),
          _AnnotatedImage(url: result.features.annotatedUrl, height: 230),
          const SizedBox(height: 21),

          const _Legend(),
          const SizedBox(height: 22),
          const Text(
            'Heatmap',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          _AnnotatedImage(
            url: result.heatmapUrl,
            height: 230,
            fit: BoxFit.fill,
          ),
          const SizedBox(height: 20),
          const _AttentionScale(),
        ],
      ),
    );

    if (isWide) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 4, child: details),
          const SizedBox(width: 24),
          Expanded(flex: 6, child: images),
        ],
      );
    }

    return Column(children: [details, const SizedBox(height: 18), images]);
  }
}

class _DrawingSamplePage extends StatefulWidget {
  const _DrawingSamplePage({required this.promptText});

  final String promptText;

  @override
  State<_DrawingSamplePage> createState() => _DrawingSamplePageState();
}

class _DrawingSamplePageState extends State<_DrawingSamplePage> {
  final List<_DrawingStroke> _strokes = [];
  Size _canvasSize = Size.zero;
  bool _isSaving = false;
  int? _activeStylusPointer;
  bool _showedTouchWarning = false;

  void _startStroke(Offset point) {
    setState(() {
      _strokes.add(_DrawingStroke([point]));
    });
  }

  void _extendStroke(Offset point) {
    if (_strokes.isEmpty) {
      return;
    }

    setState(() {
      _strokes.last.points.add(point);
    });
  }

  void _undo() {
    if (_strokes.isEmpty) {
      return;
    }

    setState(() {
      _strokes.removeLast();
    });
  }

  void _clear() {
    setState(() {
      _strokes.clear();
    });
  }

  bool _isStylusInput(ui.PointerDeviceKind kind) {
    return kind == ui.PointerDeviceKind.stylus ||
        kind == ui.PointerDeviceKind.invertedStylus;
  }

  void _warnAboutTouchInput() {
    if (_showedTouchWarning) {
      return;
    }

    _showedTouchWarning = true;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'השתמשו בעט של המכשיר בכדי להעתיק את הטקסט שכתוב למעלה. לאחר סיום תלחצו על הכפתור הירוק.',
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (_strokes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Draw a handwriting sample first.')),
      );
      return;
    }

    if (_canvasSize.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('The drawing area is not ready yet.')),
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    try {
      final pngBytes = await _renderDrawingToPng(_strokes, _canvasSize);
      final directory = await Directory.systemTemp.createTemp('dyscreen_');
      final file = File(
        '${directory.path}/handwriting_sample_${DateTime.now().millisecondsSinceEpoch}.png',
      );
      await file.writeAsBytes(pngBytes);

      if (!mounted) {
        return;
      }

      Navigator.of(context).pop(
        PlatformFile(
          name: 'handwriting_sample.png',
          path: file.path,
          size: pngBytes.length,
        ),
      );
    } catch (err) {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Could not save drawing: $err')));
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080817),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
              child: Row(
                children: [
                  IconButton(
                    tooltip: 'Back',
                    onPressed: _isSaving
                        ? null
                        : () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.arrow_back_rounded),
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Draw handwriting sample',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: 'Undo',
                    onPressed: _isSaving || _strokes.isEmpty ? null : _undo,
                    icon: const Icon(Icons.undo_rounded),
                  ),
                  IconButton(
                    tooltip: 'Clear',
                    onPressed: _isSaving || _strokes.isEmpty ? null : _clear,
                    icon: const Icon(Icons.delete_outline_rounded),
                  ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    onPressed: _isSaving ? null : _save,
                    icon: _isSaving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.check_rounded),
                    label: Text(_isSaving ? 'Saving...' : 'Use sample'),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF04AA6D),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 18),
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0x2204AA6D),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0x6604AA6D)),
                      ),
                      child: const Row(
                        children: [
                          Icon(
                            Icons.info_outline_rounded,
                            color: Color(0xFF8CE7C4),
                          ),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _drawingInstructionsText,
                              style: TextStyle(
                                color: Color(0xFFDDE2F2),
                                fontSize: 15,
                                height: 1.35,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0x1AFFFFFF),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0x334D5B86)),
                      ),
                      child: Text(
                        widget.promptText,
                        textAlign: TextAlign.center,
                        textDirection: TextDirection.rtl,
                        style: const TextStyle(
                          color: Color(0xFFDDE2F2),
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          height: 1.4,
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Expanded(
                      child: Center(
                        child: AspectRatio(
                          aspectRatio: 2.0,
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              _canvasSize = Size(
                                constraints.maxWidth,
                                constraints.maxHeight,
                              );

                              return ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: DecoratedBox(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    border: Border.all(
                                      color: const Color(0xFFB9C0D7),
                                      width: 2,
                                    ),
                                  ),
                                  child: Listener(
                                    behavior: HitTestBehavior.opaque,
                                    onPointerDown: (event) {
                                      if (!_isStylusInput(event.kind)) {
                                        _warnAboutTouchInput();
                                        return;
                                      }

                                      _activeStylusPointer = event.pointer;
                                      _startStroke(event.localPosition);
                                    },
                                    onPointerMove: (event) {
                                      if (event.pointer !=
                                          _activeStylusPointer) {
                                        return;
                                      }

                                      final point = event.localPosition;
                                      if (point.dx < 0 ||
                                          point.dy < 0 ||
                                          point.dx > _canvasSize.width ||
                                          point.dy > _canvasSize.height) {
                                        return;
                                      }
                                      _extendStroke(point);
                                    },
                                    onPointerUp: (event) {
                                      if (event.pointer ==
                                          _activeStylusPointer) {
                                        _activeStylusPointer = null;
                                      }
                                    },
                                    onPointerCancel: (event) {
                                      if (event.pointer ==
                                          _activeStylusPointer) {
                                        _activeStylusPointer = null;
                                      }
                                    },
                                    child: CustomPaint(
                                      painter: _HandwritingPainter(_strokes),
                                      size: Size.infinite,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawingStroke {
  _DrawingStroke(this.points);

  final List<Offset> points;
}

class _HandwritingPainter extends CustomPainter {
  const _HandwritingPainter(this.strokes);

  final List<_DrawingStroke> strokes;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    for (final stroke in strokes) {
      final points = stroke.points;
      if (points.isEmpty) {
        continue;
      }

      if (points.length == 1) {
        canvas.drawCircle(points.first, 2, paint..style = PaintingStyle.fill);
        paint.style = PaintingStyle.stroke;
        continue;
      }

      final path = Path()..moveTo(points.first.dx, points.first.dy);
      for (final point in points.skip(1)) {
        path.lineTo(point.dx, point.dy);
      }
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _HandwritingPainter oldDelegate) {
    return true;
  }
}

Future<Uint8List> _renderDrawingToPng(
  List<_DrawingStroke> strokes,
  Size canvasSize,
) async {
  const outputWidth = 1600;
  final outputHeight = (outputWidth / 1.414).round();
  final scale = outputWidth / canvasSize.width;
  final recorder = ui.PictureRecorder();
  final canvas = Canvas(recorder);

  canvas.drawRect(
    Rect.fromLTWH(0, 0, outputWidth.toDouble(), outputHeight.toDouble()),
    Paint()..color = Colors.white,
  );
  canvas.scale(scale);
  _HandwritingPainter(strokes).paint(canvas, canvasSize);

  final picture = recorder.endRecording();
  final image = await picture.toImage(outputWidth, outputHeight);
  final byteData = await image.toByteData(format: ui.ImageByteFormat.png);

  if (byteData == null) {
    throw const FileSystemException('PNG export returned no bytes.');
  }

  return byteData.buffer.asUint8List();
}

class _GlassPanel extends StatelessWidget {
  const _GlassPanel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: const Color(0x14060010),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0x66364096)),
        boxShadow: const [
          BoxShadow(
            color: ui.Color.fromARGB(255, 9, 9, 9),
            blurRadius: 28,
            offset: Offset(0, 18),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _StepPill extends StatelessWidget {
  const _StepPill({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0x1AFFFFFF),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0x264D5B86)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: const Color(0xFF8CE7C4)),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _SelectedFileTile extends StatelessWidget {
  const _SelectedFileTile({required this.file});

  final PlatformFile? file;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0x14000000),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0x224D5B86)),
      ),
      child: Row(
        children: [
          const Icon(Icons.insert_drive_file_rounded, color: Color(0xFF8CE7C4)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              file?.name ?? 'No file selected',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0x33FF5A5F),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0x80FF5A5F)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: Color(0xFFFFC7C9)),
          const SizedBox(width: 10),
          Expanded(child: Text(message)),
        ],
      ),
    );
  }
}

class _ResultBadge extends StatelessWidget {
  const _ResultBadge({required this.result});

  final AnalysisResult result;

  @override
  Widget build(BuildContext context) {
    final highLikelihood = result.probabilityPercent >= 50;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: highLikelihood
            ? const Color(0x22FF5A5F)
            : const Color(0x2204AA6D),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: highLikelihood
              ? const Color(0x99FF5A5F)
              : const Color(0x9904AA6D),
        ),
      ),
      child: Row(
        children: [
          Icon(
            highLikelihood
                ? Icons.warning_amber_rounded
                : Icons.check_circle_outline_rounded,
            color: highLikelihood
                ? const Color(0xFFFFA7AA)
                : const Color(0xFF8CE7C4),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Screening result: ${result.label}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _LikelihoodBar extends StatelessWidget {
  const _LikelihoodBar({required this.probability});

  final double probability;

  @override
  Widget build(BuildContext context) {
    final color = probability < 50
        ? const Color(0xFF04AA6D)
        : const Color(0xFFFF5A5F);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Likelihood percentage',
              style: TextStyle(
                color: Color(0xFFDDE2F2),
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(
              '${probability.toStringAsFixed(4)}%',
              style: TextStyle(color: color, fontWeight: FontWeight.w800),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: (probability / 100).clamp(0, 1),
            minHeight: 18,
            backgroundColor: const Color(0x1FFFFFFF),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}

class _MetricGrid extends StatelessWidget {
  const _MetricGrid({required this.features});

  final FeatureDetails features;

  @override
  Widget build(BuildContext context) {
    final metrics = [
      _Metric('Detected lines', features.detectedLines.toString()),
      _Metric('Total words', features.totalWordsFound.toString()),
      _Metric('Words above baseline', features.countAboveLines.toString()),
      _Metric('Words below baseline', features.countUnderLines.toString()),
      _Metric('Large word spacing', features.largeGapCount.toString()),
      _Metric('Total spaces', features.amountSpaces.toString()),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth > 520 ? 2 : 1;
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: metrics.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            childAspectRatio: columns == 2 ? 3.1 : 5.4,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
          ),
          itemBuilder: (context, index) {
            final metric = metrics[index];
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0x14000000),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0x224D5B86)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    metric.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xFFB9C0D7),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    metric.value,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _AnnotatedImage extends StatelessWidget {
  const _AnnotatedImage({
    required this.url,
    this.height = 320,
    this.fit = BoxFit.contain,
  });

  final String url;
  final double height;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      return const _ImagePlaceholder(text: 'No annotated image returned');
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: InteractiveViewer(
        minScale: 0.8,
        maxScale: 4,
        child: Container(
          height: height,
          color: Colors.white,
          alignment: Alignment.center,
          child: Image.network(
            url,
            width: double.infinity,
            height: height,
            fit: fit,
            loadingBuilder: (context, child, progress) {
              if (progress == null) {
                return child;
              }
              return SizedBox(
                height: height,
                child: Center(child: CircularProgressIndicator()),
              );
            },
            errorBuilder: (context, error, stackTrace) {
              return const _ImagePlaceholder(
                text: 'Could not load annotated image',
              );
            },
          ),
        ),
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  const _ImagePlaceholder({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 320,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(text, style: const TextStyle(color: Color(0xFF22243A))),
    );
  }
}

class _Legend extends StatelessWidget {
  const _Legend();

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 16,
      runSpacing: 10,
      children: const [
        _LegendItem(label: 'Word above baseline', color: Colors.blue),
        _LegendItem(label: 'Word below baseline', color: Colors.yellow),
        _LegendItem(label: 'Normal word', color: Colors.red),
        _LegendItem(label: 'Detected baseline', color: Colors.lime),
        _LegendItem(label: 'Large word spacing', color: Colors.redAccent),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  const _LegendItem({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            border: Border.all(color: color, width: 3),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 7),
        Text(label, style: const TextStyle(color: Color(0xFFDDE2F2))),
      ],
    );
  }
}

class _AttentionScale extends StatelessWidget {
  const _AttentionScale();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 20),
      decoration: BoxDecoration(
        color: const Color(0x14000000),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0x224D5B86)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Attention Scale',
            textAlign: TextAlign.start,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
          ),
          SizedBox(height: 12),
          _AttentionGradientBar(),
          SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('1.0', style: TextStyle(fontSize: 16)),
              Text('0.0', style: TextStyle(fontSize: 16)),
            ],
          ),
          SizedBox(height: 12),
          _AttentionScaleLabels(),
        ],
      ),
    );
  }
}

class _AttentionGradientBar extends StatelessWidget {
  const _AttentionGradientBar();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 24,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(6),
        gradient: const LinearGradient(
          colors: [
            Color(0xFFFF2A12),
            Color(0xFFFF9B00),
            Color(0xFFFFFF00),
            Color(0xFF12B7FF),
            Color(0xFF123BFF),
          ],
        ),
      ),
    );
  }
}

class _AttentionScaleLabels extends StatelessWidget {
  const _AttentionScaleLabels();

  @override
  Widget build(BuildContext context) {
    const items = [
      _AttentionScaleItem(
        title: 'Very High',
        subtitle: 'Strongest\ninfluence',
        color: Color(0xFFFF2A12),
      ),
      _AttentionScaleItem(
        title: 'High',
        subtitle: 'Important\nregions',
        color: Color(0xFFFF9B00),
      ),
      _AttentionScaleItem(
        title: 'Medium',
        subtitle: 'Moderate\ninfluence',
        color: Color(0xFFFFFF00),
      ),
      _AttentionScaleItem(
        title: 'Low',
        subtitle: 'Lower\ninfluence',
        color: Color(0xFF12B7FF),
      ),
      _AttentionScaleItem(
        title: 'Very Low',
        subtitle: 'Background /\nminimal',
        color: Color(0xFF123BFF),
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < 560) {
          return const Wrap(
            spacing: 16,
            runSpacing: 18,
            alignment: WrapAlignment.center,
            children: items,
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [for (final item in items) Expanded(child: item)],
        );
      },
    );
  }
}

class _AttentionScaleItem extends StatelessWidget {
  const _AttentionScaleItem({
    required this.title,
    required this.subtitle,
    required this.color,
  });

  final String title;
  final String subtitle;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 96,
      child: Column(
        children: [
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: color,
              fontSize: 16,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFFC9C8D3),
              fontSize: 14,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}

class AnalysisResult {
  const AnalysisResult({
    required this.probability,
    required this.predictedClass,
    required this.label,
    required this.features,
    required this.heatmapUrl,
  });

  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    return AnalysisResult(
      probability: _number(json['prob']),
      predictedClass: _integer(json['pred_class']),
      label: json['label']?.toString() ?? 'Unknown',
      features: FeatureDetails.fromJson(
        (json['features'] as Map?)?.cast<String, dynamic>() ?? const {},
      ),
      heatmapUrl: json['heatmap_url']?.toString() ?? 'Unknown',
    );
  }

  final double probability;
  final int predictedClass;
  final String label;
  final FeatureDetails features;
  final String heatmapUrl;

  double get probabilityPercent => probability * 100;
}

class FeatureDetails {
  const FeatureDetails({
    required this.annotatedUrl,
    required this.detectedLines,
    required this.countUnderLines,
    required this.countAboveLines,
    required this.totalWordsFound,
    required this.amountSpaces,
    required this.largeGapCount,
  });

  factory FeatureDetails.fromJson(Map<String, dynamic> json) {
    final lines = json['merged_lines'];
    return FeatureDetails(
      annotatedUrl: json['annotated_url']?.toString() ?? '',
      detectedLines: lines is List ? lines.length : _integer(lines),
      countUnderLines: _integer(json['count_under_lines']),
      countAboveLines: _integer(json['count_above_lines']),
      totalWordsFound: _integer(json['total_words_found']),
      amountSpaces: _integer(json['amount_spaces']),
      largeGapCount: _integer(json['large_gap_count']),
    );
  }

  final String annotatedUrl;
  final int detectedLines;
  final int countUnderLines;
  final int countAboveLines;
  final int totalWordsFound;
  final int amountSpaces;
  final int largeGapCount;
}

class _Metric {
  const _Metric(this.label, this.value);

  final String label;
  final String value;
}

class UploadException implements Exception {
  const UploadException(this.message);

  final String message;
}

double _number(Object? value) {
  if (value is num) {
    return value.toDouble();
  }
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

int _integer(Object? value) {
  if (value is num) {
    return value.toInt();
  }
  return int.tryParse(value?.toString() ?? '') ?? 0;
}
