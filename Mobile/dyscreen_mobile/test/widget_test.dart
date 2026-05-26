import 'package:dyscreen_mobile/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows the DyScreen upload flow', (WidgetTester tester) async {
    await tester.pumpWidget(const DyscreenApp());

    expect(find.text('DyScreen'), findsOneWidget);
    expect(find.text('Welcome to DyScreen'), findsOneWidget);
    expect(find.text('Choose file'), findsOneWidget);
    expect(find.text('Draw sample'), findsOneWidget);
    expect(find.text('Submit'), findsOneWidget);
  });
}
