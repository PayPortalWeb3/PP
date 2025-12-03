/**
 * PayPortal Admin Panel
 * Production admin interface for merchants to manage payment links and view payments
 */

export interface AdminPanelOptions {
  baseUrl: string;
  basePath: string;
  apiKey: string;
  chains: Array<{ chainId: number; name: string; symbol: string }>;
}

/**
 * Generate the admin panel HTML
 */
export function generateAdminHTML(options: AdminPanelOptions): string {
  const { baseUrl, basePath, chains } = options;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PayPortal Admin</title>
  <style>
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --bg: #0f172a;
      --bg-card: #1e293b;
      --bg-input: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #475569;
      --success: #22c55e;
      --warning: #f59e0b;
      --error: #ef4444;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    
    .header {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
    }
    
    .logo span { color: var(--text); }
    
    .header-info {
      display: flex;
      gap: 16px;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--success);
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
    }
    
    .tabs {
      display: flex;
      gap: 4px;
      background: var(--bg-card);
      padding: 4px;
      border-radius: 10px;
      margin-bottom: 24px;
      width: fit-content;
    }
    
    .tab {
      padding: 10px 20px;
      border: none;
      background: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .tab:hover { color: var(--text); }
    .tab.active { background: var(--primary); color: white; }
    
    .panel { display: none; }
    .panel.active { display: block; }
    
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    
    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 10px 14px;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 0.875rem;
    }
    
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    
    .btn-primary:hover { background: var(--primary-dark); }
    
    .btn-secondary {
      background: var(--bg-input);
      color: var(--text);
      border: 1px solid var(--border);
    }
    
    .btn-danger {
      background: var(--error);
      color: white;
    }
    
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.75rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
    }
    
    th {
      color: var(--text-muted);
      font-weight: 500;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-success { background: rgba(34, 197, 94, 0.2); color: var(--success); }
    .badge-warning { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
    .badge-error { background: rgba(239, 68, 68, 0.2); color: var(--error); }
    
    .empty {
      text-align: center;
      padding: 48px;
      color: var(--text-muted);
    }
    
    .result {
      margin-top: 16px;
      padding: 16px;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    
    .result.success {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid var(--success);
    }
    
    .result.error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--error);
    }
    
    .result pre {
      margin-top: 12px;
      padding: 12px;
      background: var(--bg);
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.8rem;
    }
    
    .link-url {
      color: var(--primary);
      text-decoration: none;
      word-break: break-all;
    }
    
    .link-url:hover { text-decoration: underline; }
    
    .mono { font-family: monospace; font-size: 0.8rem; }
    
    .actions { display: flex; gap: 8px; }
    
    @media (max-width: 768px) {
      .header { flex-direction: column; gap: 12px; }
      .stats { grid-template-columns: 1fr 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      table { font-size: 0.75rem; }
      th, td { padding: 8px; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo">Pay<span>Portal</span> Admin</div>
    <div class="header-info">
      <span><span class="status-dot"></span>Connected</span>
      <span>${chains.map(c => c.symbol).join(' • ')}</span>
    </div>
  </header>
  
  <div class="container">
    <div class="stats" id="stats">
      <div class="stat-card">
        <div class="stat-label">Total Links</div>
        <div class="stat-value" id="stat-links">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Payments</div>
        <div class="stat-value" id="stat-payments">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Confirmed</div>
        <div class="stat-value" id="stat-confirmed">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Subscriptions</div>
        <div class="stat-value" id="stat-subs">-</div>
      </div>
    </div>
    
    <div class="tabs">
      <button class="tab active" onclick="switchTab('links')">Payment Links</button>
      <button class="tab" onclick="switchTab('payments')">Payments</button>
      <button class="tab" onclick="switchTab('subscriptions')">Subscriptions</button>
      <button class="tab" onclick="switchTab('create')">Create Link</button>
    </div>
    
    <div id="links-panel" class="panel active">
      <div class="card">
        <div class="card-title">Payment Links</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Price</th>
              <th>Status</th>
              <th>Uses</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="links-table"></tbody>
        </table>
        <div id="links-empty" class="empty" style="display:none">No payment links yet</div>
      </div>
    </div>
    
    <div id="payments-panel" class="panel">
      <div class="card">
        <div class="card-title">Payments</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Link</th>
              <th>Chain</th>
              <th>Amount</th>
              <th>Status</th>
              <th>TX Hash</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody id="payments-table"></tbody>
        </table>
        <div id="payments-empty" class="empty" style="display:none">No payments yet</div>
      </div>
    </div>
    
    <div id="subscriptions-panel" class="panel">
      <div class="card">
        <div class="card-title">Subscriptions</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subscriber</th>
              <th>Interval</th>
              <th>Status</th>
              <th>Next Due</th>
              <th>Cycles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="subs-table"></tbody>
        </table>
        <div id="subs-empty" class="empty" style="display:none">No subscriptions yet</div>
      </div>
    </div>
    
    <div id="create-panel" class="panel">
      <div class="card">
        <div class="card-title">Create Payment Link</div>
        <form id="create-form" onsubmit="createLink(event)">
          <div class="form-grid">
            <div class="form-group">
              <label>Target URL *</label>
              <input type="url" id="targetUrl" required placeholder="https://example.com/content">
            </div>
            <div class="form-group">
              <label>Description</label>
              <input type="text" id="description" placeholder="Premium content access">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Amount *</label>
              <input type="text" id="amount" required placeholder="0.01">
            </div>
            <div class="form-group">
              <label>Token *</label>
              <select id="tokenSymbol" required>
                ${chains.map(c => `<option value="${c.symbol}" data-chain="${c.chainId}">${c.symbol} (${c.name})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Recipient Address *</label>
              <input type="text" id="recipientAddress" required placeholder="0x... or Solana address">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Max Uses (optional)</label>
              <input type="number" id="maxUses" placeholder="Unlimited">
            </div>
            <div class="form-group">
              <label>Expires At (optional)</label>
              <input type="datetime-local" id="expiresAt">
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Create Payment Link</button>
        </form>
        <div id="create-result"></div>
      </div>
    </div>
  </div>
  
  <script>
    const API_KEY = getCookie('pp_admin_key') || prompt('Enter API Key:');
    if (API_KEY) setCookie('pp_admin_key', API_KEY, 7);
    
    const API_BASE = '${baseUrl}';
    const PAY_PATH = '${basePath}';
    
    function getCookie(name) {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
    }
    
    function setCookie(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + 24*60*60*1000*days);
      document.cookie = name + '=' + value + ';path=/;expires=' + d.toUTCString();
    }
    
    async function api(path, options = {}) {
      const res = await fetch(API_BASE + path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          ...options.headers
        }
      });
      return res.json();
    }
    
    function switchTab(tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById(tab + '-panel').classList.add('active');
      if (tab === 'links') loadLinks();
      if (tab === 'payments') loadPayments();
      if (tab === 'subscriptions') loadSubscriptions();
    }
    
    async function loadStats() {
      const [links, payments, subs] = await Promise.all([
        api('/api/links'),
        api('/api/payments'),
        api('/api/subscriptions')
      ]);
      document.getElementById('stat-links').textContent = links.links?.length || 0;
      document.getElementById('stat-payments').textContent = payments.payments?.length || 0;
      document.getElementById('stat-confirmed').textContent = payments.payments?.filter(p => p.confirmed).length || 0;
      document.getElementById('stat-subs').textContent = subs.subscriptions?.filter(s => s.status === 'active').length || 0;
    }
    
    async function loadLinks() {
      const data = await api('/api/links');
      const tbody = document.getElementById('links-table');
      const empty = document.getElementById('links-empty');
      
      if (!data.links?.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      
      empty.style.display = 'none';
      tbody.innerHTML = data.links.map(link => \`
        <tr>
          <td class="mono">\${link.id}</td>
          <td>\${link.description || '-'}</td>
          <td>\${link.price.amount} \${link.price.tokenSymbol}</td>
          <td><span class="badge \${link.status === 'active' ? 'badge-success' : 'badge-error'}">\${link.status}</span></td>
          <td>\${link.usedCount || 0}\${link.maxUses ? '/' + link.maxUses : ''}</td>
          <td>\${new Date(link.createdAt).toLocaleDateString()}</td>
          <td class="actions">
            <button class="btn btn-secondary btn-sm" onclick="copyLink('\${link.id}')">Copy</button>
            <button class="btn btn-danger btn-sm" onclick="disableLink('\${link.id}')">Disable</button>
          </td>
        </tr>
      \`).join('');
    }
    
    async function loadPayments() {
      const data = await api('/api/payments');
      const tbody = document.getElementById('payments-table');
      const empty = document.getElementById('payments-empty');
      
      if (!data.payments?.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      
      empty.style.display = 'none';
      tbody.innerHTML = data.payments.map(p => \`
        <tr>
          <td class="mono">\${p.id.slice(0,8)}...</td>
          <td class="mono">\${p.paymentLinkId}</td>
          <td>\${p.chainId}</td>
          <td>\${p.amount}</td>
          <td><span class="badge \${p.confirmed ? 'badge-success' : 'badge-warning'}">\${p.confirmed ? 'Confirmed' : 'Pending'}</span></td>
          <td class="mono">\${p.txHash.slice(0,12)}...</td>
          <td>\${new Date(p.createdAt).toLocaleDateString()}</td>
        </tr>
      \`).join('');
    }
    
    async function loadSubscriptions() {
      const data = await api('/api/subscriptions');
      const tbody = document.getElementById('subs-table');
      const empty = document.getElementById('subs-empty');
      
      if (!data.subscriptions?.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      
      empty.style.display = 'none';
      tbody.innerHTML = data.subscriptions.map(s => \`
        <tr>
          <td class="mono">\${s.id.slice(0,12)}...</td>
          <td class="mono">\${s.subscriberAddress.slice(0,12)}...</td>
          <td>\${s.interval}</td>
          <td><span class="badge badge-\${s.status === 'active' ? 'success' : s.status === 'past_due' ? 'warning' : 'error'}">\${s.status}</span></td>
          <td>\${new Date(s.nextPaymentDue).toLocaleDateString()}</td>
          <td>\${s.cycleCount}</td>
          <td class="actions">
            \${s.status === 'active' ? '<button class="btn btn-secondary btn-sm" onclick="pauseSub(\\'' + s.id + '\\')">Pause</button>' : ''}
            \${s.status === 'paused' ? '<button class="btn btn-secondary btn-sm" onclick="resumeSub(\\'' + s.id + '\\')">Resume</button>' : ''}
            <button class="btn btn-danger btn-sm" onclick="cancelSub('\${s.id}')">Cancel</button>
          </td>
        </tr>
      \`).join('');
    }
    
    async function createLink(e) {
      e.preventDefault();
      const select = document.getElementById('tokenSymbol');
      const chainId = parseInt(select.options[select.selectedIndex].dataset.chain);
      
      const data = {
        targetUrl: document.getElementById('targetUrl').value,
        description: document.getElementById('description').value || undefined,
        amount: document.getElementById('amount').value,
        tokenSymbol: select.value,
        chainId,
        recipientAddress: document.getElementById('recipientAddress').value,
        maxUses: parseInt(document.getElementById('maxUses').value) || undefined,
        expiresAt: document.getElementById('expiresAt').value || undefined,
      };
      
      const result = await api('/api/links', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      const div = document.getElementById('create-result');
      if (result.success) {
        div.innerHTML = \`
          <div class="result success">
            <strong>✓ Payment Link Created</strong><br>
            <a href="\${result.link.url}" target="_blank" class="link-url">\${result.link.url}</a>
            <pre>\${JSON.stringify(result.link, null, 2)}</pre>
          </div>
        \`;
        document.getElementById('create-form').reset();
        loadStats();
      } else {
        div.innerHTML = \`<div class="result error">Error: \${JSON.stringify(result)}</div>\`;
      }
    }
    
    function copyLink(id) {
      navigator.clipboard.writeText(API_BASE + PAY_PATH + '/' + id);
      alert('Link copied!');
    }
    
    async function disableLink(id) {
      if (!confirm('Disable this payment link?')) return;
      await api('/api/links/' + id, { method: 'DELETE' });
      loadLinks();
      loadStats();
    }
    
    async function pauseSub(id) {
      await api('/api/subscriptions/' + id + '/pause', { method: 'POST' });
      loadSubscriptions();
    }
    
    async function resumeSub(id) {
      await api('/api/subscriptions/' + id + '/resume', { method: 'POST' });
      loadSubscriptions();
    }
    
    async function cancelSub(id) {
      if (!confirm('Cancel this subscription?')) return;
      await api('/api/subscriptions/' + id + '/cancel', { method: 'POST' });
      loadSubscriptions();
      loadStats();
    }
    
    // Initial load
    loadStats();
    loadLinks();
  </script>
</body>
</html>`;
}

