import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String _samplePromptText =
    'הטכנולוגיה המודרנית משנה את הדרך שבה אנו לומדים ומתקשרים זה עם זה בכל יום. בעזרת מחשבים וטלפונים חכמים, אפשר למצוא מידע במהירות, לכתוב סיפורים מעניינים ולשתף תמונות עם חברים רחוקים. למרות השינויים הרבים, חשוב מאוד להמשיך לתרגל גם כתיבה ביד, כיוון שהיא עוזרת לנו לפתח את המחשבה, הזיכרון והיצירתיות שלנו. ';
const String _drawingInstructionsText =
    'Use the tablet pen only. Copy the text below exactly as shown, then tap Use sample.';

abstract final class _AppColors {
  static const background = Color(0xFFF0F7FF);
  static const foreground = Color(0xFF0F2137);
  static const card = Color(0xFFFFFFFF);
  static const primary = Color(0xFF0284C7);
  static const primarySoft = Color(0xFFE0F2FE);
  static const accent = Color(0xFF0D9488);
  static const accentSoft = Color(0xFFE6FFFB);
  static const muted = Color(0xFFEFF6FF);
  static const mutedText = Color(0xFF5B7A96);
  static const border = Color(0xFFE1EEF7);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
}

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
          seedColor: _AppColors.primary,
          brightness: Brightness.light,
          primary: _AppColors.primary,
          secondary: _AppColors.accent,
          surface: _AppColors.card,
        ),
        scaffoldBackgroundColor: _AppColors.background,
        fontFamily: Platform.isIOS ? 'SF Pro Display' : null,
        textTheme: ThemeData.light().textTheme.apply(
          bodyColor: _AppColors.foreground,
          displayColor: _AppColors.foreground,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: _AppColors.background,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _AppColors.primary, width: 2),
          ),
        ),
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

class _DyscreenHomePageState extends State<DyscreenHomePage> {
  late final TextEditingController _apiBaseController;
  PlatformFile? _selectedFile;
  AnalysisResult? _result;
  bool _isUploading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _apiBaseController = TextEditingController(text: _defaultApiBaseUrl());
  }

  @override
  void dispose() {
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
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 900;
            return CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: EdgeInsets.symmetric(
                    horizontal: isWide ? 44 : 18,
                    vertical: isWide ? 26 : 16,
                  ),
                  sliver: SliverToBoxAdapter(
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 1060),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const _AppHeader(),
                            SizedBox(height: isWide ? 54 : 34),
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
                            if (_result == null) ...[
                              const SizedBox(height: 42),
                              const _HowItWorksSection(),
                              const SizedBox(height: 28),
                              const _DisclaimerCard(),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _AppHeader extends StatelessWidget {
  const _AppHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: _AppColors.primary,
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(
            Icons.psychology_rounded,
            size: 20,
            color: Colors.white,
          ),
        ),
        const SizedBox(width: 10),
        const Text(
          'DyScreen',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            letterSpacing: 0,
          ),
        ),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: _AppColors.card,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: _AppColors.border),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.shield_outlined, size: 16, color: _AppColors.primary),
              SizedBox(width: 6),
              Text(
                'Screening Tool',
                style: TextStyle(
                  color: _AppColors.mutedText,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ],
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
    final intro = Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: const [
        _StatusPill(),
        SizedBox(height: 18),
        _HeroTitle(),
        SizedBox(height: 16),
        Text(
          'Upload a handwriting sample or write directly on the tablet canvas. DyScreen analyzes handwriting patterns and returns visual screening feedback in under 30 seconds.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: _AppColors.mutedText,
            fontSize: 16,
            height: 1.65,
          ),
        ),
        SizedBox(height: 22),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          alignment: WrapAlignment.center,
          children: [
            _StepPill(icon: Icons.bolt_rounded, text: 'AI Detection'),
            _StepPill(icon: Icons.bar_chart_rounded, text: '8 Metrics'),
            _StepPill(icon: Icons.visibility_rounded, text: 'Heatmaps'),
            _StepPill(icon: Icons.trending_up_rounded, text: 'Risk Score'),
          ],
        ),
      ],
    );

    final controls = _GlassPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'New Analysis',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          const Text(
            'Choose how you want to provide the handwriting sample.',
            style: TextStyle(color: _AppColors.mutedText, fontSize: 14),
          ),
          const SizedBox(height: 18),
          LayoutBuilder(
            builder: (context, constraints) {
              final twoColumns = constraints.maxWidth >= 560;
              final uploadCard = _ModeActionCard(
                icon: Icons.upload_rounded,
                iconColor: _AppColors.primary,
                iconBackground: _AppColors.primarySoft,
                title: 'Upload Image',
                description:
                    'Select a clear photo, scan, PNG, JPG, JPEG, or PDF.',
                bullets: const ['From files', 'Camera scans', 'PDF support'],
                onTap: isUploading ? null : onPickFile,
              );
              final drawCard = _ModeActionCard(
                icon: Icons.draw_rounded,
                iconColor: _AppColors.accent,
                iconBackground: _AppColors.accentSoft,
                title: 'Write Directly',
                description:
                    'Use the tablet pen to copy the Hebrew sample on canvas.',
                bullets: const ['Stylus input', 'Undo / clear', 'Save sample'],
                onTap: isUploading ? null : onDrawSample,
              );

              if (twoColumns) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: uploadCard),
                    const SizedBox(width: 14),
                    Expanded(child: drawCard),
                  ],
                );
              }

              return Column(
                children: [uploadCard, const SizedBox(height: 14), drawCard],
              );
            },
          ),
          const SizedBox(height: 16),
          _SelectedFileTile(file: selectedFile),
          const SizedBox(height: 14),
          TextField(
            controller: apiBaseController,
            decoration: const InputDecoration(
              labelText: 'API host',
              hintText: 'http://127.0.0.1:8000',
              prefixIcon: Icon(Icons.dns_rounded),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: isUploading ? null : onSubmit,
            icon: isUploading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.send_rounded),
            label: Text(isUploading ? 'Analyzing...' : 'Analyze Handwriting'),
            style: FilledButton.styleFrom(
              backgroundColor: _AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(56),
              textStyle: const TextStyle(fontWeight: FontWeight.w800),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
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
              const SizedBox(height: 32),
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
        const SizedBox(height: 30),
        controls,
        const SizedBox(height: 8),
      ],
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: _AppColors.primarySoft,
        borderRadius: BorderRadius.circular(999),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.shield_outlined, size: 16, color: _AppColors.primary),
          SizedBox(width: 8),
          Text(
            'Screening Tool - Not a Medical Diagnosis',
            style: TextStyle(
              color: _AppColors.primary,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroTitle extends StatelessWidget {
  const _HeroTitle();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text(
          'AI-Powered',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 42,
            height: 1.12,
            fontWeight: FontWeight.w900,
            letterSpacing: 0,
          ),
        ),
        ShaderMask(
          blendMode: BlendMode.srcIn,
          shaderCallback: (bounds) => const LinearGradient(
            colors: [_AppColors.primary, _AppColors.accent],
          ).createShader(bounds),
          child: const Text(
            'Dysgraphia Screening',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 42,
              height: 1.12,
              fontWeight: FontWeight.w900,
              letterSpacing: 0,
            ),
          ),
        ),
      ],
    );
  }
}

class _ModeActionCard extends StatelessWidget {
  const _ModeActionCard({
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.title,
    required this.description,
    required this.bullets,
    required this.onTap,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final String title;
  final String description;
  final List<String> bullets;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: _AppColors.card,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: onTap == null ? _AppColors.border : _AppColors.border,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: iconBackground,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: iconColor, size: 28),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                description,
                style: const TextStyle(
                  color: _AppColors.mutedText,
                  height: 1.45,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 14),
              for (final bullet in bullets) ...[
                Row(
                  children: [
                    const Icon(
                      Icons.check_circle_rounded,
                      size: 15,
                      color: _AppColors.accent,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      bullet,
                      style: const TextStyle(
                        color: _AppColors.mutedText,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                if (bullet != bullets.last) const SizedBox(height: 6),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _HowItWorksSection extends StatelessWidget {
  const _HowItWorksSection();

  @override
  Widget build(BuildContext context) {
    const steps = [
      ('01', 'Submit Sample', 'Upload a photo or write directly on canvas.'),
      ('02', 'Feature Extraction', 'The AI extracts handwriting metrics.'),
      ('03', 'Classification', 'The model predicts dysgraphia risk.'),
      ('04', 'Explainability', 'Heatmaps highlight decision regions.'),
    ];

    return _GlassPanel(
      child: Column(
        children: [
          const Text(
            'How it works',
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (context, constraints) {
              final columns = constraints.maxWidth >= 760 ? 4 : 2;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: steps.length,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: columns,
                  childAspectRatio: columns == 4 ? 1.05 : 1.25,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemBuilder: (context, index) {
                  final step = steps[index];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _AppColors.background,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: _AppColors.primarySoft,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            step.$1,
                            style: const TextStyle(
                              color: _AppColors.primary,
                              fontWeight: FontWeight.w900,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          step.$2,
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          step.$3,
                          style: const TextStyle(
                            color: _AppColors.mutedText,
                            fontSize: 12,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}

class _DisclaimerCard extends StatelessWidget {
  const _DisclaimerCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.warning_amber_rounded,
            color: _AppColors.warning,
            size: 20,
          ),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'DyScreen provides screening assistance only and does not replace professional evaluation.',
              style: TextStyle(
                color: Color(0xFF92400E),
                fontSize: 13,
                height: 1.45,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
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
    final highLikelihood = result.probabilityPercent >= 50;
    final resultTitle = highLikelihood
        ? 'Potential dysgraphia markers detected'
        : 'Low marker likelihood detected';
    final resultCopy = highLikelihood
        ? 'The analysis identified signs that may warrant further professional review.'
        : 'The handwriting sample showed fewer markers in the analyzed feature set.';
    final details = _GlassPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _DisclaimerCard(),
          const SizedBox(height: 18),
          Text(
            resultTitle,
            style: const TextStyle(
              fontSize: 24,
              height: 1.2,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            resultCopy,
            style: const TextStyle(
              color: _AppColors.mutedText,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 18),
          _ResultBadge(result: result),
          const SizedBox(height: 18),
          _LikelihoodBar(probability: result.probabilityPercent),
          const SizedBox(height: 24),
          const Text(
            'Handwriting Metrics',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          _MetricGrid(features: result.features),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: onReset,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('New Analysis'),
            style: FilledButton.styleFrom(
              backgroundColor: _AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(56),
              textStyle: const TextStyle(fontWeight: FontWeight.w800),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
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
          const Row(
            children: [
              Icon(Icons.visibility_rounded, color: _AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Visual Analysis',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SectionLabel(icon: Icons.layers_rounded, text: 'Feature selection'),
          const SizedBox(height: 10),
          _AnnotatedImage(url: result.features.annotatedUrl, height: 250),
          const SizedBox(height: 14),
          const _Legend(),
          const SizedBox(height: 22),
          const _SectionLabel(
            icon: Icons.local_fire_department,
            text: 'Heatmap',
          ),
          const SizedBox(height: 10),
          _AnnotatedImage(
            url: result.heatmapUrl,
            height: 250,
            fit: BoxFit.fill,
          ),
          const SizedBox(height: 16),
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

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: _AppColors.primary),
        const SizedBox(width: 8),
        Text(
          text,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
        ),
      ],
    );
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
      backgroundColor: _AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(10, 10, 12, 10),
              decoration: const BoxDecoration(
                color: _AppColors.card,
                border: Border(bottom: BorderSide(color: _AppColors.border)),
              ),
              child: Row(
                children: [
                  IconButton(
                    tooltip: 'Back',
                    color: _AppColors.mutedText,
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
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: 'Undo',
                    color: _AppColors.mutedText,
                    onPressed: _isSaving || _strokes.isEmpty ? null : _undo,
                    icon: const Icon(Icons.undo_rounded),
                  ),
                  IconButton(
                    tooltip: 'Clear',
                    color: _AppColors.mutedText,
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
                      backgroundColor: _AppColors.accent,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
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
                        color: _AppColors.accentSoft,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFB7F4EC)),
                      ),
                      child: const Row(
                        children: [
                          Icon(
                            Icons.info_outline_rounded,
                            color: _AppColors.accent,
                          ),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _drawingInstructionsText,
                              style: TextStyle(
                                color: _AppColors.foreground,
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
                        color: _AppColors.card,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: _AppColors.border),
                      ),
                      child: Text(
                        widget.promptText,
                        textAlign: TextAlign.center,
                        textDirection: TextDirection.rtl,
                        style: const TextStyle(
                          color: _AppColors.foreground,
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
                                borderRadius: BorderRadius.circular(18),
                                child: DecoratedBox(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    border: Border.all(
                                      color: _AppColors.border,
                                      width: 2,
                                    ),
                                    boxShadow: const [
                                      BoxShadow(
                                        color: Color(0x140284C7),
                                        blurRadius: 24,
                                        offset: Offset(0, 12),
                                      ),
                                    ],
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x120284C7),
            blurRadius: 22,
            offset: Offset(0, 12),
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
        color: _AppColors.card,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: _AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: _AppColors.primary),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(
              color: _AppColors.foreground,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
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
        color: _AppColors.muted,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _AppColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.insert_drive_file_rounded, color: _AppColors.accent),
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
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: _AppColors.danger),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: Color(0xFF991B1B),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
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
            ? const Color(0xFFFEF2F2)
            : const Color(0xFFE6FFFB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: highLikelihood
              ? const Color(0xFFFECACA)
              : const Color(0xFF99F6E4),
        ),
      ),
      child: Row(
        children: [
          Icon(
            highLikelihood
                ? Icons.warning_amber_rounded
                : Icons.check_circle_outline_rounded,
            color: highLikelihood ? _AppColors.danger : _AppColors.accent,
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
    final color = probability < 50 ? _AppColors.accent : _AppColors.danger;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Likelihood percentage',
              style: TextStyle(
                color: _AppColors.mutedText,
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
            backgroundColor: _AppColors.muted,
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
                color: _AppColors.muted,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: _AppColors.border),
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
                      color: _AppColors.mutedText,
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
      borderRadius: BorderRadius.circular(14),
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
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _AppColors.border),
      ),
      child: Text(text, style: const TextStyle(color: _AppColors.foreground)),
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
        Text(
          label,
          style: const TextStyle(color: _AppColors.mutedText, fontSize: 12),
        ),
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
        color: _AppColors.muted,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _AppColors.border),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Attention Scale',
            textAlign: TextAlign.start,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
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
              color: _AppColors.mutedText,
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
