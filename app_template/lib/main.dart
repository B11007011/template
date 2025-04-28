import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
import 'dart:developer' as developer;
import 'dart:io';
import 'dart:async';

// These constants will be replaced during build by environment variables
final String appName = const String.fromEnvironment('APP_NAME', defaultValue: 'WebView App');
final String primaryUrl = const String.fromEnvironment('WEBVIEW_URL', defaultValue: 'https://tecxmate.com');
final String fallbackUrl = const String.fromEnvironment('FALLBACK_URL', defaultValue: 'https://google.com');

// Offline mode HTML content
const String offlineHtml = '''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline Mode</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 20px;
      text-align: center;
      background-color: #f8f9fa;
      color: #333;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .container {
      max-width: 500px;
      padding: 30px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a73e8;
      font-size: 24px;
      margin-bottom: 10px;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
      color: #5f6368;
      margin-bottom: 20px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
      color: #ea4335;
    }
    .button {
      background-color: #1a73e8;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 10px;
      font-weight: 500;
      display: inline-block;
      text-decoration: none;
    }
    .offline-content {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dadce0;
      width: 100%;
    }
    .feature {
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 8px;
      background-color: #f1f3f4;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📶</div>
    <h1>You're offline</h1>
    <p>Please check your internet connection and try again.</p>
    <button class="button" onclick="location.reload()">Try Again</button>
    
    <div class="offline-content">
      <h2>While you're offline, you can:</h2>
      <div class="feature">
        <h3>Review cached content</h3>
        <p>Some previously loaded content may still be available.</p>
      </div>
    </div>
  </div>
</body>
</html>
''';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Set preferred orientations and system UI overlay style
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  // Modify the system UI mode to use manual instead of edgeToEdge
  SystemChrome.setEnabledSystemUIMode(
    SystemUiMode.manual,
    overlays: [SystemUiOverlay.top],
  );
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarDividerColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primarySwatch: Colors.blue,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> with WidgetsBindingObserver {
  WebViewController? _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  double _statusBarHeight = 0;
  
  // Use the constants defined at the top of the file
  final String _url = primaryUrl;
  bool _isUsingFallbackUrl = false;

  // Count down timer for auto-retry
  int _retryCountdown = 5;
  bool _isRetryingAutomatically = false;
  int _retryAttempts = 0;
  static const int maxRetryAttempts = 3;
  
  // Add offline mode flag
  bool _isOfflineMode = false;
  DateTime? _lastInternetCheckTime;
  final Duration _internetCheckCooldown = const Duration(seconds: 30);

  void _startRetryCountdown() {
    _retryCountdown = 5;
    _isRetryingAutomatically = true;
    _updateCountdown();
  }
  
  void _updateCountdown() {
    if (_retryCountdown > 0) {
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted && _isRetryingAutomatically) {
          setState(() {
            _retryCountdown--;
          });
          _updateCountdown();
        }
      });
    } else {
      if (mounted && _isRetryingAutomatically) {
        setState(() {
          _hasError = false;
          _isLoading = true;
          _isRetryingAutomatically = false;
          _retryAttempts++;
        });
        
        // Try the fallback URL after multiple retry attempts with the primary URL
        if (_retryAttempts >= maxRetryAttempts && !_isUsingFallbackUrl) {
          _isUsingFallbackUrl = true;
          developer.log('Switching to fallback URL after $maxRetryAttempts failed attempts', name: 'WebView');
        }
        
        _setupWebView();
      }
    }
  }

  // Enhanced internet connectivity check with cooldown
  Future<bool> _checkInternetConnection() async {
    // Implement cooldown to avoid excessive checks
    final now = DateTime.now();
    if (_lastInternetCheckTime != null && 
        now.difference(_lastInternetCheckTime!) < _internetCheckCooldown) {
      developer.log('Using cached internet connection status', name: 'WebView');
      return !_isOfflineMode; // Return cached result
    }

    try {
      final result = await InternetAddress.lookup('google.com')
          .timeout(const Duration(seconds: 5));
      _lastInternetCheckTime = now;
      final isConnected = result.isNotEmpty && result[0].rawAddress.isNotEmpty;
      
      if (isConnected && _isOfflineMode) {
        // We were offline but now we're online
        _isOfflineMode = false;
        developer.log('Internet connection restored, switching to online mode', name: 'WebView');
      } else if (!isConnected && !_isOfflineMode) {
        // We were online but now we're offline
        _isOfflineMode = true;
        developer.log('No internet connection detected, switching to offline mode', name: 'WebView');
      }
      
      return isConnected;
    } on SocketException catch (_) {
      _lastInternetCheckTime = now;
      _isOfflineMode = true;
      return false;
    } on TimeoutException catch (_) {
      _lastInternetCheckTime = now;
      _isOfflineMode = true;
      return false;
    } catch (e) {
      _lastInternetCheckTime = now;
      developer.log('Error checking internet connection: $e', name: 'WebView');
      _isOfflineMode = true;
      return false;
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Get the status bar height after the first frame is rendered
      _statusBarHeight = MediaQuery.of(context).padding.top;
      developer.log('Loading WebView with URL: $_url', name: 'WebView');
      _setupWebView();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controller = null;
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _controller != null) {
      _controller!.reload();
    }
  }

  // Load offline content
  Future<void> _loadOfflineContent(WebViewController controller) async {
    try {
      developer.log('Loading offline content', name: 'WebView');
      await controller.loadHtmlString(offlineHtml);
      setState(() {
        _isLoading = false;
        _hasError = false;
      });
    } catch (e) {
      developer.log('Error loading offline content: $e', name: 'WebView');
      setState(() {
        _isLoading = false;
        _hasError = true;
        _errorMessage = 'Failed to load offline content: $e';
      });
    }
  }

  Future<void> _setupWebView() async {
    try {
      // Check internet connection before setting up WebView
      final hasInternet = await _checkInternetConnection();

      late final PlatformWebViewControllerCreationParams params;
      if (WebViewPlatform.instance is WebKitWebViewPlatform) {
        params = WebKitWebViewControllerCreationParams(
          allowsInlineMediaPlayback: true,
          mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
        );
      } else {
        params = const PlatformWebViewControllerCreationParams();
      }

      final WebViewController controller = WebViewController.fromPlatformCreationParams(params);

      if (controller.platform is AndroidWebViewController) {
        AndroidWebViewController.enableDebugging(true);
        (controller.platform as AndroidWebViewController)
          ..setMediaPlaybackRequiresUserGesture(false)
          ..setBackgroundColor(Colors.transparent);
      }

      // Enable JavaScript
      await controller.setJavaScriptMode(JavaScriptMode.unrestricted);
      
      // Set transparent background
      await controller.setBackgroundColor(Colors.transparent);
      
      // Set custom user agent for better compatibility
      await controller.setUserAgent('Mozilla/5.0 (Linux; Android 12; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36');
      
      // Configure additional settings for WebView
      if (controller.platform is AndroidWebViewController) {
        final AndroidWebViewController androidController = controller.platform as AndroidWebViewController;
        androidController.setMediaPlaybackRequiresUserGesture(false);
        androidController.setBackgroundColor(Colors.transparent);
        
        // Note: Advanced settings like setDomStorageEnabled are not available in this version
      }

      await controller.setNavigationDelegate(
        NavigationDelegate(
          onUrlChange: (UrlChange change) {
            developer.log('URL changed to: ${change.url}', name: 'WebView');
          },
          onNavigationRequest: (NavigationRequest request) {
            developer.log('Navigation request to: ${request.url}', name: 'WebView');
            
            // Check if we're in offline mode and trying to navigate
            if (_isOfflineMode && !request.url!.startsWith('data:')) {
              // When in offline mode, prevent navigation to external URLs
              developer.log('Blocked navigation in offline mode: ${request.url}', name: 'WebView');
              // Allow local content navigation
              return NavigationDecision.prevent;
            }
            
            // Allow all navigation requests, including cross-origin ones
            return NavigationDecision.navigate;
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
            developer.log('Page started loading: $url', name: 'WebView');
          },
          onPageFinished: (String url) async {
            developer.log('Page finished loading: $url', name: 'WebView');
            
            // Only inject adjustments if not in offline mode
            if (!_isOfflineMode) {
              // Inject CSS to adjust the website's header to avoid status bar overlap
              await _injectViewportAdjustment(controller);
              
              // Inject JavaScript to enhance cross-origin compatibility
              await _injectCompatibilityFixes(controller);
            }
            
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            developer.log('WebView error: ${error.errorCode} - ${error.description}', name: 'WebView');
            developer.log('Error details: isForMainFrame=${error.isForMainFrame}, url=${error.url}', name: 'WebView');
            
            // Only set error state for major errors, not for resource loading errors
            if (error.isForMainFrame ?? false) {
              // Handle network-related errors
              if (error.description.contains('ERR_INTERNET_DISCONNECTED') ||
                  error.description.contains('net::ERR_NETWORK_CHANGED') ||
                  error.description.contains('net::ERR_CONNECTION_REFUSED')) {
                // Internet connection lost while browsing
                setState(() {
                  _isOfflineMode = true;
                });
                
                // Load offline content
                _loadOfflineContent(controller);
                return;
              }
              
              setState(() {
                _isLoading = false;
                _hasError = true;
                _errorMessage = '${error.errorCode}: ${error.description}';
                
                // Start auto-retry countdown for network-related errors
                if (error.description.contains('ERR_CACHE_MISS') || 
                    error.description.contains('net::ERR') ||
                    error.description.contains('ERR_CONNECTION') ||
                    error.description.contains('ERR_NAME_NOT_RESOLVED') ||
                    error.description.contains('ERR_INTERNET_DISCONNECTED')) {
                  
                  _startRetryCountdown();
                  
                  // Try the fallback URL immediately for DNS resolution errors
                  if ((error.description.contains('ERR_NAME_NOT_RESOLVED') || 
                       error.description.contains('ERR_UNKNOWN_URL_SCHEME')) && 
                      !_isUsingFallbackUrl) {
                    _isUsingFallbackUrl = true;
                    developer.log('DNS resolution failed, switching to fallback URL immediately', name: 'WebView');
                  }
                }
              });
            }
          },
        ),
      );

      if (mounted) {
        setState(() {
          _controller = controller;
        });
      }

      // Decide what content to load based on connectivity
      if (!hasInternet) {
        // No internet connection, load offline content
        setState(() {
          _isOfflineMode = true;
          _errorMessage = 'No internet connection. Using offline mode.';
        });
        await _loadOfflineContent(controller);
      } else {
        // Internet is available, load the web content
        // Update URL loading logic to handle fallback URL
        final String urlToLoad = _isUsingFallbackUrl ? fallbackUrl : _url;
        developer.log('Loading URL: $urlToLoad (${_isUsingFallbackUrl ? 'fallback' : 'primary'})', name: 'WebView');

        try {
          // Add cache control headers and more robust error handling
          await controller.loadRequest(
            Uri.parse(urlToLoad),
            headers: {
              'Accept': '*/*',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'max-age=3600',  // Cache content for up to 1 hour
              'Pragma': 'no-cache',             // For backwards compatibility
              'Connection': 'keep-alive',
              'User-Agent': 'Mozilla/5.0 (Linux; Android 12; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
            },
          );
        } catch (e) {
          developer.log('Error loading URL with headers: $e', name: 'WebView');
          // Fallback to a direct load without headers if the initial load fails
          await controller.loadRequest(Uri.parse(urlToLoad));
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasError = true;
          _errorMessage = e.toString();
        });
      }
    }
  }

  // Inject JavaScript to adjust viewport to prevent status bar overlap
  Future<void> _injectViewportAdjustment(WebViewController controller) async {
    // Convert status bar height to viewport height units
    await controller.runJavaScript('''
      (function() {
        // Add a padding to the top of the body or adjust the header position
        document.body.style.paddingTop = "${_statusBarHeight}px";
        // Look for header or navigation elements that might need adjustment
        var header = document.querySelector('header') || 
                     document.querySelector('.header') || 
                     document.querySelector('.app-header') ||
                     document.querySelector('nav');
        if (header) {
          header.style.marginTop = "${_statusBarHeight}px";
        }
      })();
    ''');
  }

  // Inject JavaScript to enhance compatibility
  Future<void> _injectCompatibilityFixes(WebViewController controller) async {
    await controller.runJavaScript('''
      (function() {
        // Override certain browser APIs that might be causing issues
        if (window.fetch) {
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            if (!options) options = {};
            if (!options.headers) options.headers = {};
            options.headers['Access-Control-Allow-Origin'] = '*';
            return originalFetch(url, options);
          };
        }
        
        // Add meta tag for viewport
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        document.head.appendChild(meta);
        
        // Make cross-origin XMLHttpRequests more permissive if possible
        if (window.XMLHttpRequest) {
          const originalOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            const xhr = this;
            xhr.setRequestHeader = function(name, value) {
              if (name.toLowerCase() === 'origin') return;
              XMLHttpRequest.prototype.setRequestHeader.call(this, name, value);
            };
            return originalOpen.call(this, method, url, async, user, password);
          };
        }
      })();
    ''');
  }

  // Add method to switch between offline and online modes
  Future<void> _switchToOnlineMode() async {
    // Check if internet is actually available before switching
    final hasInternet = await _checkInternetConnection();
    if (hasInternet) {
      setState(() {
        _isOfflineMode = false;
        _isLoading = true;
      });
      
      if (_controller != null) {
        final String urlToLoad = _isUsingFallbackUrl ? fallbackUrl : _url;
        try {
          await _controller!.loadRequest(Uri.parse(urlToLoad));
        } catch (e) {
          developer.log('Error switching to online mode: $e', name: 'WebView');
          // If unable to switch to online mode, stay in offline mode
          await _loadOfflineContent(_controller!);
        }
      }
    } else {
      // Show a message that internet is still unavailable
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Internet connection is still unavailable'),
            duration: Duration(seconds: 3),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark.copyWith(
        statusBarColor: Colors.transparent,
        systemNavigationBarColor: Colors.transparent,
      ),
      child: PopScope(
        onPopInvoked: (bool didPop) async {
          if (didPop) return;
          if (_controller == null) {
            Navigator.of(context).pop();
            return;
          }
          
          try {
            // If in offline mode or showing an error, handle back differently
            if (_isOfflineMode || _hasError) {
              // Check if internet is back before exiting
              final hasInternet = await _checkInternetConnection();
              if (hasInternet && _isOfflineMode) {
                // Internet is back, reload the page
                setState(() {
                  _isOfflineMode = false;
                  _hasError = false;
                  _isLoading = true;
                });
                _setupWebView();
                return;
              }
              
              // Otherwise, exit the app
              if (context.mounted) {
                Navigator.of(context).pop();
              }
              return;
            }
            
            final canGoBack = await _controller!.canGoBack();
            if (canGoBack) {
              await _controller!.goBack();
            } else {
              if (context.mounted) {
                Navigator.of(context).pop();
              }
            }
          } catch (e) {
            if (context.mounted) {
              Navigator.of(context).pop();
            }
          }
        },
        child: Scaffold(
          // Don't extend body behind app bar to prevent overlap
          extendBodyBehindAppBar: false,
          extendBody: false,
          // Add an app bar in offline mode for better UX
          appBar: _isOfflineMode ? AppBar(
            title: const Text('Offline Mode'),
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
            actions: [
              IconButton(
                icon: const Icon(Icons.wifi),
                onPressed: _switchToOnlineMode,
                tooltip: 'Try to reconnect',
              ),
            ],
          ) : null,
          body: Column(
            children: [
              // Add a container with the same height as the status bar
              // to ensure we have proper spacing
              if (!_isOfflineMode) // No need for this in offline mode with AppBar
                Container(
                  height: MediaQuery.of(context).padding.top,
                  color: Colors.transparent,
                ),
              Expanded(
                child: Stack(
                  children: [
                    if (_controller != null)
                      WebViewWidget(
                        controller: _controller!,
                      ),
                    if (_isLoading)
                      Container(
                        color: Colors.white.withAlpha(179),
                        child: const Center(
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                            strokeWidth: 3,
                          ),
                        ),
                      ),
                    if (_hasError && !_isOfflineMode) // Only show this error screen if not in offline mode
                      Container(
                        color: Colors.white,
                        padding: const EdgeInsets.all(16),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.error_outline,
                                color: Colors.red,
                                size: 48,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                _errorMessage,
                                style: const TextStyle(color: Colors.red),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              if (_errorMessage.contains('ERR_NAME_NOT_RESOLVED'))
                                const Text(
                                  'Unable to resolve the website address. This may be due to a misspelled URL, the site being unavailable, or network issues.',
                                  style: TextStyle(fontSize: 14),
                                  textAlign: TextAlign.center,
                                ),
                              const SizedBox(height: 16),
                              // Add option to switch to offline mode when having network issues
                              if (_errorMessage.contains('ERR_INTERNET_DISCONNECTED') || 
                                 _errorMessage.contains('net::ERR_NAME_NOT_RESOLVED') ||
                                 _errorMessage.contains('ERR_CONNECTION_REFUSED')) ...[
                                ElevatedButton.icon(
                                  onPressed: () {
                                    setState(() {
                                      _isOfflineMode = true;
                                      _hasError = false;
                                    });
                                    _loadOfflineContent(_controller!);
                                  },
                                  icon: const Icon(Icons.offline_bolt),
                                  label: const Text('Switch to Offline Mode'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.amber[700],
                                    foregroundColor: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 16),
                              ],
                              if (_isRetryingAutomatically) ...[
                                Text(
                                  'Auto-retrying in $_retryCountdown seconds...',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                LinearProgressIndicator(
                                  value: (5 - _retryCountdown) / 5, // Progress from 0 to 1
                                  backgroundColor: Colors.grey[300],
                                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
                                ),
                                const SizedBox(height: 16),
                                TextButton(
                                  onPressed: () {
                                    setState(() {
                                      _isRetryingAutomatically = false;
                                    });
                                  },
                                  child: const Text('Cancel auto-retry'),
                                ),
                              ] else
                                ElevatedButton.icon(
                                  onPressed: () {
                                    setState(() {
                                      _hasError = false;
                                      _isLoading = true;
                                    });
                                    _setupWebView();
                                  },
                                  icon: const Icon(Icons.refresh),
                                  label: const Text('Retry Now', style: TextStyle(fontSize: 16)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.blue,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}