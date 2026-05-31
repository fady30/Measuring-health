import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  Future<void> _handleLogin() async {
    try {
      final response = await http.post(
        Uri.parse('https://localhost:3000/hashing'),
        body: {'username': 'test', 'password': '123'},
      );

      print('Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');
    } catch (e) {
      print('Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "Measuring health",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 30),
              _buildInputField("Username:"),
              const SizedBox(height: 20),
              _buildInputField("Password:", isPassword: true),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _handleLogin,
                child: const Text("Login"),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField(String label, {bool isPassword = false}) {
    return Row(
      children: [
        SizedBox(width: 150, child: Text(label)),
        Expanded(
          child: TextField(
            obscureText: isPassword,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 10),
            ),
          ),
        ),
      ],
    );
  }
}
