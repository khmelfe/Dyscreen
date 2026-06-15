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

  Future<void> removingFiles() async {
    final result = _result;
    if (result == null) return;

    final apiBase = _apiBaseController.text.trim().replaceAll(
      RegExp(r'/+$'),
      '',
    );
    final uri = Uri.parse('$apiBase/upload_file');
    await http.delete(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        "photo": result.features.annotatedUrl,
        "heatmap": result.heatmapUrl,
        "OG": result.originalPath,
      }),
    );
  }

  Future<void> _reset() async {
    try {
      await removingFiles();
    } catch (e) {
      print("Deletion Failed $e");
    }
    //Make Deletion in the server.
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
                              const _AboutSection(),
                              const SizedBox(height: 28),
                              const _DisclaimerCard(),
                              const SizedBox(height: 28),
                              const _AppFooter(),
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
            _StepPill(icon: Icons.bolt_rounded, text: 'Deep learning'),
            _StepPill(icon: Icons.bar_chart_rounded, text: '6 Metrics'),
            _StepPill(icon: Icons.visibility_rounded, text: 'Heatmaps'),
            _StepPill(icon: Icons.trending_up_rounded, text: 'Screening Score'),
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
          'Welcome to',
          textAlign: TextAlign.start,
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
            'DyScreen',
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
      (
        '01',
        'Submit Sample',
        'Upload a clear photo or scan of a handwritten Hebrew sample.',
      ),
      (
        '02',
        'Feature Extraction',
        'The model extracts 6 quantitative handwriting metrics.',
      ),
      (
        '03',
        'Classification',
        'A fine-tuned CNN model predicts Likelihood percentage of Learning disabilities.',
      ),
      (
        '04',
        'Explainability',
        'Grad-CAM heatmaps highlight the decision-making regions.',
      ),
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
                    padding: const EdgeInsets.all(20),
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
                          height: 30,
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
                              fontSize: 14,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          step.$2,
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          step.$3,
                          style: const TextStyle(
                            color: _AppColors.mutedText,
                            fontSize: 14,
                            height: 1.4,
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
              'DyScreen provide a preliminary screening assistance only and does not replace professional evaluation.',
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

class _AboutSection extends StatelessWidget {
  const _AboutSection();

  @override
  Widget build(BuildContext context) {
    const metrics = [
      (
        'Detected Lines',
        'Measures the percentage of words that remain stable on the detected writing baseline',
      ),
      ('Total Words', 'The total number of words'),
      (
        'Words Above Baseline',
        'Counts how many words drifted significantly above the expected line threshold',
      ),
      (
        'Words Under Baseline',
        'Counts how many words dipped below the baseline threshold, which can indicate spatial tracking difficulties',
      ),
      (
        'Average Word Spacing',
        'The mathematical average distance between words, establishing the writer\'s baseline spatial layout',
      ),
      ('Above-Average Gaps', 'The total spaces above the average gap'),
    ];

    final leftColumn = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'ABOUT',
          style: TextStyle(
            color: _AppColors.accent,
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'What is a Learning disability?',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 14),
        const Text(
          'Learning differences can impact how a person processes information and expresses themselves, often showing up as persistent challenges with writing, reading, spelling, or maintaining focus. Because conditions like dysgraphia, dyslexia, and ADHD frequently overlap, understanding a student\'s unique profile is essential.',
          style: TextStyle(
            color: _AppColors.mutedText,
            fontSize: 14,
            height: 1.7,
          ),
        ),
        const SizedBox(height: 10),
        const Text(
          'DyScreen is designed to provide a preliminary screening, giving users a clear initial indication of potential learning and writing challenges.',
          style: TextStyle(
            color: _AppColors.mutedText,
            fontSize: 14,
            height: 1.7,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFFDE68A)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.warning_amber_rounded,
                color: Color(0xFFF59E0B),
                size: 18,
              ),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Disclaimer: DyScreen provides first screening assistance only. Results do not constitute a clinical diagnosis. Always consult a qualified educational specialist or occupational therapist.',
                  style: TextStyle(
                    color: Color(0xFF92400E),
                    fontSize: 13,
                    height: 1.6,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );

    final rightColumn = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Metrics analyzed',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        for (final (i, m) in metrics.indexed) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _AppColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _AppColors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.check_circle_rounded,
                  size: 16,
                  color: _AppColors.accent,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        m.$1,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        m.$2,
                        style: const TextStyle(
                          color: _AppColors.mutedText,
                          fontSize: 12,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (i < metrics.length - 1) const SizedBox(height: 8),
        ],
      ],
    );

    return _GlassPanel(
      child: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth >= 640) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: leftColumn),
                const SizedBox(width: 24),
                Expanded(child: rightColumn),
              ],
            );
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [leftColumn, const SizedBox(height: 24), rightColumn],
          );
        },
      ),
    );
  }
}

class _AppFooter extends StatelessWidget {
  const _AppFooter();

  @override
  Widget build(BuildContext context) {
    const logo = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.psychology_rounded, size: 16, color: _AppColors.primary),
        SizedBox(width: 8),
        Flexible(
          child: Text(
            'DyScreen · Deep Learning Handwriting Screening · 2026',
            style: TextStyle(color: _AppColors.mutedText, fontSize: 12),
          ),
        ),
      ],
    );
    const warning = Text(
      '⚠️ Not a diagnostic tool · For preliminary screening purposes only',
      style: TextStyle(color: _AppColors.mutedText, fontSize: 12),
    );

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      decoration: BoxDecoration(
        color: _AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _AppColors.border),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth >= 500) {
            return const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [logo, warning],
            );
          }
          return const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [logo, SizedBox(height: 8), warning],
          );
        },
      ),
    );
  }
}

class _ResultsSurface extends StatefulWidget {
  const _ResultsSurface({
    required this.isWide,
    required this.result,
    required this.onReset,
  });

  final bool isWide;
  final AnalysisResult result;
  final VoidCallback onReset;

  @override
  State<_ResultsSurface> createState() => _ResultsSurfaceState();
}

class _ResultsSurfaceState extends State<_ResultsSurface> {
  bool _showHeatmap = false;

  @override
  Widget build(BuildContext context) {
    final result = widget.result;
    final confidence = result.probabilityPercent;
    final riskScore = confidence.round();

    final String riskLabel;
    final String riskHeadline;
    final String riskBody;
    final Color riskColor;
    final Color riskBg;

    if (riskScore < 35) {
      riskLabel = 'Low Risk';
      riskHeadline = 'No significant learning disabilities markers detected';
      riskBody =
          'The analysis indicates that the handwriting patterns closely align with typical development. Minimal to no indicators of LDs — such as severe baseline drift or highly irregular letter sizing — were found.';
      riskColor = const Color(0xFF059669);
      riskBg = const Color(0xFFECFDF5);
    } else if (riskScore < 65) {
      riskLabel = 'Moderate Risk';
      riskHeadline = 'Potential learning disabilities markers detected';
      riskBody =
          'The analysis identified moderate signs consistent with LDs — such as inconsistent word spacing, baseline drift, and variable letter sizing. These patterns suggest that writing may require significantly more effort than usual.';
      riskColor = const Color(0xFFD97706);
      riskBg = const Color(0xFFFFFBEB);
    } else {
      riskLabel = 'High Risk';
      riskHeadline = 'Strong learning disabilities markers detected';
      riskBody =
          'The analysis identified pronounced, consistent indicators strongly associated with LDs. These include highly irregular letter formations, significant spacing inconsistencies, and severe baseline deviations across the analyzed text.';
      riskColor = const Color(0xFFDC2626);
      riskBg = const Color(0xFFFEF2F2);
    }

    final formattedDate = _formatDate(DateTime.now());

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Disclaimer
        const _DisclaimerCard(),
        const SizedBox(height: 16),

        // Header card: gauge + risk info
        _GlassPanel(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  _GaugeChart(score: riskScore),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: riskBg,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      riskLabel,
                      style: TextStyle(
                        color: riskColor,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Analysis · $formattedDate',
                      style: const TextStyle(
                        color: _AppColors.mutedText,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      riskHeadline,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      riskBody,
                      style: const TextStyle(
                        color: _AppColors.mutedText,
                        fontSize: 13,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _ResultStatItem(
                          label: 'Likelihood',
                          value: '${confidence.toStringAsFixed(1)}%',
                          color: _AppColors.primary,
                        ),
                        const SizedBox(width: 24),
                        const _ResultStatItem(
                          label: 'Metrics Analyzed',
                          value: '6',
                          color: _AppColors.accent,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Visual Analysis card with Original / Heatmap toggle
        _GlassPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Visual Analysis',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                  ),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: _AppColors.muted,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _ImageToggleButton(
                          label: 'Original',
                          active: !_showHeatmap,
                          onTap: () => setState(() => _showHeatmap = false),
                        ),
                        _ImageToggleButton(
                          label: 'Heatmap',
                          active: _showHeatmap,
                          icon: Icons.layers_rounded,
                          onTap: () => setState(() => _showHeatmap = true),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _AnnotatedImage(
                url: _showHeatmap
                    ? result.heatmapUrl
                    : result.features.annotatedUrl,
                height: 260,
                fit: _showHeatmap ? BoxFit.fill : BoxFit.contain,
              ),
              const SizedBox(height: 8),
              Text(
                _showHeatmap
                    ? 'Red = regions that most influenced the model prediction.'
                    : 'Original submitted handwriting sample.',
                style: const TextStyle(
                  color: _AppColors.mutedText,
                  fontSize: 11,
                ),
              ),
              if (!_showHeatmap) ...[
                const SizedBox(height: 12),
                const _Legend(),
              ],
              if (_showHeatmap) ...[
                const SizedBox(height: 12),
                const _AttentionScale(),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Handwriting Metrics card
        _GlassPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Handwriting Metrics',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 12),
              _MetricProgressTile(
                label: 'Detected Lines',
                value: result.features.detectedLines,
                maxValue: 5,
              ),
              const SizedBox(height: 10),
              _MetricProgressTile(
                label: 'Total Words',
                value: result.features.totalWordsFound,
                maxValue: 50,
              ),
              const SizedBox(height: 16),
              LayoutBuilder(
                builder: (context, constraints) {
                  final cols = constraints.maxWidth >= 480 ? 2 : 1;
                  return GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: cols,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: cols == 2 ? 2.6 : 4.0,
                    children: [
                      _MetricStatCard(
                        title: 'Words Above Baseline',
                        value: result.features.countAboveLines.toString(),
                      ),
                      _MetricStatCard(
                        title: 'Words Below Baseline',
                        value: result.features.countUnderLines.toString(),
                      ),
                      _MetricStatCard(
                        title: 'Average Word Spacing',
                        value: result.features.largeGapCount.toString(),
                      ),
                      _MetricStatCard(
                        title: 'Above-Average Gaps',
                        value: result.features.amountSpaces.toString(),
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // New Analysis CTA
        OutlinedButton(
          onPressed: widget.onReset,
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(54),
            side: const BorderSide(color: _AppColors.border),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            foregroundColor: _AppColors.foreground,
            textStyle: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 15,
            ),
          ),
          child: const Text('← New Analysis'),
        ),
        const SizedBox(height: 28),
      ],
    );
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

String _formatDate(DateTime date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${months[date.month - 1]} ${date.day}, ${date.year}';
}

class _GaugeChart extends StatelessWidget {
  const _GaugeChart({required this.score});

  final int score;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(160, 90),
      painter: _GaugePainter(score: score),
    );
  }
}

class _GaugePainter extends CustomPainter {
  _GaugePainter({required this.score});

  final int score;

  @override
  void paint(Canvas canvas, Size size) {
    const double cx = 80.0;
    const double cy = 80.0;
    const double innerR = 42.0;
    const double outerR = 62.0;
    const double startAngle = math.pi;
    const double totalAngle = math.pi;

    canvas.scale(size.width / 160.0, size.height / 90.0);

    final segmentData = [
      (startAngle, startAngle + totalAngle * 0.35, const Color(0xFF0D9488)),
      (
        startAngle + totalAngle * 0.35,
        startAngle + totalAngle * 0.65,
        const Color(0xFFF59E0B),
      ),
      (
        startAngle + totalAngle * 0.65,
        startAngle + totalAngle,
        const Color(0xFFEF4444),
      ),
    ];

    for (final seg in segmentData) {
      final from = seg.$1;
      final to = seg.$2;
      final path = Path();
      path.moveTo(cx + outerR * math.cos(from), cy + outerR * math.sin(from));
      path.arcTo(
        Rect.fromCircle(center: const Offset(cx, cy), radius: outerR),
        from,
        to - from,
        false,
      );
      path.lineTo(cx + innerR * math.cos(to), cy + innerR * math.sin(to));
      path.arcTo(
        Rect.fromCircle(center: const Offset(cx, cy), radius: innerR),
        to,
        from - to,
        false,
      );
      path.close();
      canvas.drawPath(path, Paint()..color = seg.$3);
    }

    final needleAngle = startAngle + (score / 100.0) * totalAngle;
    final needleX = cx + 50.0 * math.cos(needleAngle);
    final needleY = cy + 50.0 * math.sin(needleAngle);

    canvas.drawLine(
      const Offset(cx, cy),
      Offset(needleX, needleY),
      Paint()
        ..color = _AppColors.foreground
        ..strokeWidth = 2.5
        ..strokeCap = StrokeCap.round,
    );
    canvas.drawCircle(
      const Offset(cx, cy),
      4,
      Paint()..color = _AppColors.foreground,
    );
  }

  @override
  bool shouldRepaint(covariant _GaugePainter oldDelegate) =>
      oldDelegate.score != score;
}

class _ResultStatItem extends StatelessWidget {
  const _ResultStatItem({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 22,
            fontWeight: FontWeight.w800,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: _AppColors.mutedText, fontSize: 12),
        ),
      ],
    );
  }
}

class _ImageToggleButton extends StatelessWidget {
  const _ImageToggleButton({
    required this.label,
    required this.active,
    required this.onTap,
    this.icon,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: active ? _AppColors.card : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: active
              ? [const BoxShadow(color: Color(0x18000000), blurRadius: 4)]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 13,
                color: active ? _AppColors.foreground : _AppColors.mutedText,
              ),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: active ? _AppColors.foreground : _AppColors.mutedText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricProgressTile extends StatelessWidget {
  const _MetricProgressTile({
    required this.label,
    required this.value,
    required this.maxValue,
  });

  final String label;
  final int value;
  final int maxValue;

  @override
  Widget build(BuildContext context) {
    final ratio = (value / maxValue).clamp(0.0, 1.0);
    final Color barColor = ratio > 0.7
        ? const Color(0xFF0D9488)
        : ratio > 0.3
        ? const Color(0xFFF59E0B)
        : const Color(0xFFEF4444);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _AppColors.muted,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                value.toString(),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: barColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Stack(
            children: [
              Container(
                height: 6,
                decoration: BoxDecoration(
                  color: _AppColors.border,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              FractionallySizedBox(
                widthFactor: ratio,
                child: Container(
                  height: 6,
                  decoration: BoxDecoration(
                    color: barColor,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricStatCard extends StatelessWidget {
  const _MetricStatCard({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _AppColors.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: _AppColors.mutedText,
              fontSize: 18,
              fontWeight: FontWeight.w600,
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
    required this.originalPath,
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
      originalPath: json['Orignal_photo']?.toString() ?? '',
    );
  }

  final double probability;
  final int predictedClass;
  final String label;
  final FeatureDetails features;
  final String heatmapUrl;
  final String originalPath;

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
