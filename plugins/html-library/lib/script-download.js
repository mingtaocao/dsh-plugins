import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

// Windows PowerShell uses .NET Framework's current-user proxy resolver (including PAC
// and bypass rules). Keep the command constant and pass the approved URL as data.
const download = `
$ErrorActionPreference = 'Stop'
try {
  [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
  if ([Net.ServicePointManager]::SecurityProtocol -ne [Net.SecurityProtocolType]::SystemDefault) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
  }
  $request = [Net.HttpWebRequest]::Create([uri]$env:DSH_SCRIPT_URL)
  $request.AllowAutoRedirect = $false
  $request.Proxy = [Net.WebRequest]::GetSystemWebProxy()
  $request.Proxy.Credentials = [Net.CredentialCache]::DefaultNetworkCredentials
  $response = $request.GetResponse()
  try {
    if ([int]$response.StatusCode -ne 200) { throw "HTTP $([int]$response.StatusCode)" }
    $stream = $response.GetResponseStream()
    $outputStream = [Console]::OpenStandardOutput()
    $stream.CopyTo($outputStream)
    $outputStream.Flush()
  } finally { $response.Close() }
} catch {
  [Console]::Error.WriteLine($_.Exception.GetBaseException().Message)
  exit 1
}
`;

export async function fetchScript(url, maxBytes, { platform = process.platform, execute = run } = {}) {
  if (platform !== 'win32') {
    return fetch(url, { redirect: 'error', credentials: 'omit', signal: AbortSignal.timeout(6000) });
  }
  const program = path.win32.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  try {
    const { stdout } = await execute(program, ['-NoProfile', '-NonInteractive', '-Command', download], {
      env: { ...process.env, DSH_SCRIPT_URL: url }, encoding: 'buffer', windowsHide: true,
      maxBuffer: Math.max(1, maxBytes), timeout: 15000,
    });
    return new Response(stdout);
  } catch (error) {
    if (error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') throw new RangeError('资源超过预览大小上限');
    if (error.killed) throw new DOMException('连接超时', 'TimeoutError');
    throw new Error(error.stderr?.toString().trim() || error.code || 'Windows 系统代理下载失败');
  }
}
