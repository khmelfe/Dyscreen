import 'package:dyscreen_mobile/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows the DyScreen upload flow', (WidgetTester tester) async {
    await tester.pumpWidget(const DyscreenApp());

    expect(find.text('DyScreen'), findsOneWidget);
    expect(find.text('AI-Powered'), findsOneWidget);
    expect(find.text('Dysgraphia Screening'), findsOneWidget);
    expect(find.text('Upload Image'), findsOneWidget);
    expect(find.text('Write Directly'), findsOneWidget);
    expect(find.text('Analyze Handwriting'), findsOneWidget);
  });
}
