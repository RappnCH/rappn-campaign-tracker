// Rappn Marketing Campaign Manager
console.log('App starting...');

const API_BASE = window.location.origin;
let campaigns = [];
let currentView = 'dashboard';
let selectedCampaign = null;
let placements = [];
let campaignAnalytics = null;
let overviewAnalytics = null;
let wizardStep = 1;
let newCampaignData = {};
let charts = {};
let campaignFilter = 'active'; // 'active', 'inactive', or 'all'

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded');
    console.log('QRCode library loaded:', typeof QRCode !== 'undefined');
    await loadCampaigns();
    renderApp();
});

async function loadCampaigns() {
    try {
        const response = await fetch(`${API_BASE}/campaigns`);
        campaigns = await response.json();
        console.log('Loaded campaigns:', campaigns);
    } catch (error) {
        console.error('Error loading campaigns:', error);
        campaigns = [];
    }
}

function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- Header -->
        <header class="gradient-bg text-white shadow-lg">
            <div class="container mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-rappn-green font-bold text-xl">R</div>
                    <h1 class="text-2xl font-bold">Rappn Campaign Manager</h1>
                </div>
                <button onclick="showNewCampaignWizard()" class="bg-white text-rappn-green px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition">
                    + New Campaign
                </button>
            </div>
        </header>

        <!-- Main Layout -->
        <div class="flex min-h-screen">
            <!-- Sidebar -->
            <aside class="w-64 bg-white shadow-lg">
                <nav class="p-4">
                    <button onclick="switchView('dashboard')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${currentView === 'dashboard' ? 'bg-gradient-to-r from-rappn-green to-rappn-blue text-white' : 'text-gray-700 hover:bg-gray-100'}">
                        <span>📊</span>
                        <span class="font-medium">Campaigns</span>
                    </button>
                    <button onclick="switchView('assets')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${currentView === 'assets' ? 'bg-gradient-to-r from-rappn-green to-rappn-blue text-white' : 'text-gray-700 hover:bg-gray-100'}">
                        <span>🖼️</span>
                        <span class="font-medium">Asset Library</span>
                    </button>
                    <button onclick="switchView('performance')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${currentView === 'performance' ? 'bg-gradient-to-r from-rappn-green to-rappn-blue text-white' : 'text-gray-700 hover:bg-gray-100'}">
                        <span>📈</span>
                        <span class="font-medium">Performance</span>
                    </button>
                    <button onclick="switchView('settings')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${currentView === 'settings' ? 'bg-gradient-to-r from-rappn-green to-rappn-blue text-white' : 'text-gray-700 hover:bg-gray-100'}">
                        <span>⚙️</span>
                        <span class="font-medium">Settings</span>
                    </button>
                </nav>
            </aside>

            <!-- Main Content -->
            <main id="main-content" class="flex-1 bg-slate-50">
                ${renderCurrentView()}
            </main>
        </div>
    `;
    
    // Generate QR codes after DOM is updated
    if (currentView === 'campaign-detail' && placements.length > 0) {
        setTimeout(() => {
            console.log('Attempting to generate QR codes...');
            generateQRCodes();
        }, 200);
    }
    
    // Render charts after DOM is updated
    if (currentView === 'performance') {
        setTimeout(() => {
            console.log('Attempting to render charts...');
            renderCharts();
        }, 200);
    }
}

function renderCurrentView() {
    switch(currentView) {
        case 'dashboard':
            return renderDashboard();
        case 'campaign-detail':
            return renderCampaignDetail();
        case 'performance':
            return renderPerformance();
        case 'assets':
            return renderAssets();
        case 'settings':
            return renderSettings();
        case 'new-campaign':
            return renderNewCampaignWizard();
        default:
            return renderDashboard();
    }
}

function renderDashboard() {
    // Filter out inactive (deleted) campaigns from dashboard
    const activeCampaigns = campaigns.filter(c => c.status !== 'inactive');
    
    return `
        <div class="p-6">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Campaign Dashboard</h2>
            
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Total Campaigns</div>
                    <div class="text-3xl font-bold text-gray-900">${activeCampaigns.length}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Active</div>
                    <div class="text-3xl font-bold text-green-600">${activeCampaigns.filter(c => c.status === 'active').length}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Draft</div>
                    <div class="text-3xl font-bold text-blue-600">${activeCampaigns.filter(c => c.status === 'draft').length}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">This Month</div>
                    <div class="text-3xl font-bold text-purple-600">${activeCampaigns.length}</div>
                </div>
            </div>

            <!-- Campaigns Table -->
            <div class="bg-white rounded-2xl shadow-md overflow-hidden">
                <div class="p-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">All Campaigns</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Campaign Name</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Geo</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Language</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${activeCampaigns.map(campaign => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4">
                                        <div class="font-medium text-gray-900">${campaign.name}</div>
                                        <div class="text-sm text-gray-500">${campaign.concept}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <code class="text-xs bg-gray-100 px-2 py-1 rounded">${campaign.campaign_id}</code>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                                            ${campaign.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-700">${campaign.geo}</td>
                                    <td class="px-6 py-4 text-sm text-gray-700">${campaign.language}</td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <button onclick="viewCampaign('${campaign.campaign_id}')" class="text-rappn-blue hover:underline text-sm font-medium">
                                                View Details
                                            </button>
                                            <span class="text-gray-300">|</span>
                                            <button onclick="toggleCampaignStatus('${campaign.campaign_id}')" class="text-yellow-600 hover:text-yellow-700 text-sm font-medium" title="${campaign.status === 'active' ? 'Set Inactive' : 'Set Active'}">
                                                ${campaign.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <span class="text-gray-300">|</span>
                                            <button onclick="deleteCampaign('${campaign.campaign_id}')" class="text-red-600 hover:text-red-700 text-sm font-medium" title="Delete Campaign">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderCampaignDetail() {
    if (!selectedCampaign) return renderDashboard();
    
    return `
        <div class="p-6">
            <button onclick="switchView('dashboard')" class="mb-4 text-rappn-blue hover:underline flex items-center">
                ← Back to Campaigns
            </button>

            <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">${selectedCampaign.name}</h1>
                        <code class="text-sm bg-gray-100 px-3 py-1 rounded">${selectedCampaign.campaign_id}</code>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="viewPerformance('${selectedCampaign.campaign_id}')" class="px-4 py-2 border border-rappn-blue text-rappn-blue rounded-lg hover:bg-blue-50">
                            📈 View Performance
                        </button>
                        <span class="px-4 py-2 rounded-full text-sm font-semibold ${selectedCampaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                            ${selectedCampaign.status.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <div>
                        <div class="text-sm text-gray-500">Geo</div>
                        <div class="font-semibold">${selectedCampaign.geo}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Language</div>
                        <div class="font-semibold">${selectedCampaign.language}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Channel</div>
                        <div class="font-semibold">${selectedCampaign.primary_channel}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Type</div>
                        <div class="font-semibold">${selectedCampaign.type}</div>
                    </div>
                </div>
            </div>

            <!-- Placements -->
            <div class="bg-white rounded-2xl shadow-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Tracking Links & Placements</h2>
                    <button onclick="showPlacementForm()" class="bg-gradient-to-r from-rappn-green to-rappn-blue text-white px-4 py-2 rounded-lg hover:opacity-90">
                        + Add Placement
                    </button>
                </div>
                
                <div id="placements-list">
                    ${placements.length === 0 ? `
                        <div class="text-center py-12 text-gray-500">
                            <p>No placements yet. Create one to generate tracking URLs!</p>
                        </div>
                    ` : placements.map((p, i) => `
                        <div class="border border-gray-200 rounded-lg p-4 mb-4">
                            <div class="flex justify-between mb-3">
                                <div>
                                    <div class="font-semibold">Placement #${p.placement_id_seq}</div>
                                    <div class="text-sm text-gray-500">${p.channel} · ${p.ad_type} · ${p.medium}</div>
                                </div>
                                <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">QR Available</span>
                            </div>
                            <div class="bg-gray-50 rounded p-3 mb-3">
                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <div><span class="text-gray-600">Source:</span> <code class="bg-white px-2 py-1 rounded">${p.utm_source}</code></div>
                                    <div><span class="text-gray-600">Medium:</span> <code class="bg-white px-2 py-1 rounded">${p.utm_medium}</code></div>
                                    <div><span class="text-gray-600">Campaign:</span> <code class="bg-white px-2 py-1 rounded">${p.utm_campaign}</code></div>
                                    <div><span class="text-gray-600">Content:</span> <code class="bg-white px-2 py-1 rounded">${p.utm_content}</code></div>
                                </div>
                            </div>
                            <div class="space-y-3">
                                <div class="mb-2">
                                    <label class="text-xs font-semibold text-rappn-green uppercase tracking-wide">📊 Tracked URL (Use this in your ads!)</label>
                                </div>
                                <div class="flex gap-2">
                                    <input type="text" value="${p.tracked_url || p.final_url}" readonly class="flex-1 px-3 py-2 bg-green-50 border-2 border-rappn-green rounded text-sm font-mono font-semibold">
                                    <button onclick="copyUrl('${p.tracked_url || p.final_url}')" class="px-4 py-2 bg-rappn-green text-white rounded hover:opacity-90">Copy Tracked URL</button>
                                    <button onclick="openTrackedUrl('${p.tracked_url || p.final_url}')" class="px-4 py-2 bg-blue-500 text-white rounded hover:opacity-90">Test</button>
                                </div>
                                ${p.final_url ? `<div class="text-xs text-gray-500 mt-2">→ Redirects to: <span class="font-mono">${p.final_url}</span></div>` : ''}
                                <div class="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                                    <div class="flex-shrink-0">
                                        <div id="qr-${p.id}" class="bg-white p-3 rounded" style="width: 200px; height: 200px;"></div>
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-sm font-semibold text-purple-900">QR Code${p.qr_id ? ': ' + p.qr_id : ''}</div>
                                        <div class="text-xs text-purple-700 mt-1">Scan to track clicks from anywhere</div>
                                    </div>
                                    <button onclick="downloadQR('qr-${p.id}', '${p.qr_id || 'QR-' + p.id}')" class="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:opacity-90">
                                        Download QR
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- New Placement Form -->
                <div id="placement-form" class="hidden mt-6 pt-6 border-t">
                    <h3 class="font-semibold mb-4">Create New Placement</h3>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Channel</label>
                            <select id="channel" class="w-full px-3 py-2 border rounded">
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                                <option value="google">Google</option>
                                <option value="flyer">Flyer</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Ad Type</label>
                            <select id="adtype" class="w-full px-3 py-2 border rounded">
                                <option value="FEED">Feed</option>
                                <option value="STORY">Story</option>
                                <option value="VIDEO">Video</option>
                                <option value="PRINT">Print</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Medium</label>
                            <select id="medium" class="w-full px-3 py-2 border rounded">
                                <option value="paid">Paid</option>
                                <option value="organic">Organic</option>
                                <option value="qr">QR Code</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Landing Page URL</label>
                            <input type="url" id="baseurl" value="https://rappn-landing-page.vercel.app/it" class="w-full px-3 py-2 border rounded">
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="createPlacement()" class="bg-gradient-to-r from-rappn-green to-rappn-blue text-white px-6 py-2 rounded-lg hover:opacity-90">
                            Generate Link
                        </button>
                        <button onclick="hidePlacementForm()" class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAssets() {
    return `
        <div class="p-6">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Asset Library</h2>
            <div class="grid grid-cols-3 gap-6 mb-6">
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Total Assets</div>
                    <div class="text-3xl font-bold">24</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Images</div>
                    <div class="text-3xl font-bold text-blue-600">16</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Videos</div>
                    <div class="text-3xl font-bold text-purple-600">8</div>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-md p-6">
                <p class="text-gray-500 text-center py-8">Asset management coming soon...</p>
            </div>
        </div>
    `;
}

function renderSettings() {
    return `
        <div class="p-6">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Settings</h2>
            <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Tracking Defaults</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Default Landing Page URL</label>
                        <input type="text" value="https://rappn-landing-page.vercel.app/it" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">QR ID Pattern</label>
                        <input type="text" value="QR-{GEO}-{CHAN}-{CONCEPT}-{LANG}-{SEQ}" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-md p-6">
                <h3 class="text-lg font-semibold mb-4">Integrations</h3>
                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 border rounded-lg">
                        <span>Google Analytics 4</span>
                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Connected</span>
                    </div>
                    <div class="flex justify-between items-center p-3 border rounded-lg">
                        <span>Google Drive</span>
                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Connected</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderNewCampaignWizard() {
    return `
        <div class="p-6 max-w-4xl mx-auto">
            <div class="mb-6">
                <button onclick="switchView('dashboard')" class="text-rappn-blue hover:underline">← Back to Dashboard</button>
            </div>

            <div class="bg-white rounded-2xl shadow-md p-8">
                <h2 class="text-3xl font-bold mb-2">Create New Campaign</h2>
                <p class="text-gray-600 mb-8">Follow these steps to set up your campaign tracking</p>

                <!-- Progress Steps -->
                <div class="flex justify-between mb-8">
                    ${[1,2,3,4].map(step => `
                        <div class="flex items-center ${step < 4 ? 'flex-1' : ''}">
                            <div class="flex flex-col items-center">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center ${wizardStep >= step ? 'bg-gradient-to-r from-rappn-green to-rappn-blue text-white' : 'bg-gray-200 text-gray-500'} font-semibold">
                                    ${step}
                                </div>
                                <div class="text-xs mt-2 ${wizardStep >= step ? 'text-rappn-green font-semibold' : 'text-gray-500'}">
                                    ${['Basic Info', 'Details', 'Targeting', 'Review'][step-1]}
                                </div>
                            </div>
                            ${step < 4 ? `<div class="flex-1 h-1 mx-4 ${wizardStep > step ? 'bg-gradient-to-r from-rappn-green to-rappn-blue' : 'bg-gray-200'}"></div>` : ''}
                        </div>
                    `).join('')}
                </div>

                <!-- Step Content -->
                <div id="wizard-content">
                    ${renderWizardStep()}
                </div>
            </div>
        </div>
    `;
}

function renderWizardStep() {
    switch(wizardStep) {
        case 1:
            return `
                <div>
                    <h3 class="text-xl font-bold mb-4">Step 1: Basic Information</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Campaign Name *</label>
                            <input type="text" id="campaign-name" value="${newCampaignData.name || ''}" 
                                placeholder="e.g., Zurich — Cheapest Basket (DE)"
                                class="w-full px-4 py-2 border rounded-lg">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Start Date *</label>
                                <input type="date" id="start-date" value="${newCampaignData.date_start || ''}" class="w-full px-4 py-2 border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">End Date *</label>
                                <input type="date" id="end-date" value="${newCampaignData.date_end || ''}" class="w-full px-4 py-2 border rounded-lg">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Description</label>
                            <textarea id="description" rows="3" value="${newCampaignData.description || ''}" 
                                placeholder="Brief description of the campaign..."
                                class="w-full px-4 py-2 border rounded-lg">${newCampaignData.description || ''}</textarea>
                        </div>
                    </div>
                    <div class="flex justify-end mt-6">
                        <button onclick="nextWizardStep()" class="bg-gradient-to-r from-rappn-green to-rappn-blue text-white px-6 py-2 rounded-lg hover:opacity-90">
                            Next Step →
                        </button>
                    </div>
                </div>
            `;
        case 2:
            return `
                <div>
                    <h3 class="text-xl font-bold mb-4">Step 2: Campaign Details</h3>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Primary Channel *</label>
                                <select id="primary-channel" class="w-full px-4 py-2 border rounded-lg">
                                    <option value="">Select channel...</option>
                                    <option value="FB" ${newCampaignData.primary_channel === 'FB' ? 'selected' : ''}>Facebook</option>
                                    <option value="IG" ${newCampaignData.primary_channel === 'IG' ? 'selected' : ''}>Instagram</option>
                                    <option value="GOOGLE" ${newCampaignData.primary_channel === 'GOOGLE' ? 'selected' : ''}>Google</option>
                                    <option value="MULTI" ${newCampaignData.primary_channel === 'MULTI' ? 'selected' : ''}>Multi-Channel</option>
                                    <option value="EMAIL" ${newCampaignData.primary_channel === 'EMAIL' ? 'selected' : ''}>Email</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Campaign Type *</label>
                                <select id="campaign-type" class="w-full px-4 py-2 border rounded-lg">
                                    <option value="">Select type...</option>
                                    <option value="PAID" ${newCampaignData.type === 'PAID' ? 'selected' : ''}>Paid</option>
                                    <option value="ORGANIC" ${newCampaignData.type === 'ORGANIC' ? 'selected' : ''}>Organic</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Concept/Theme *</label>
                            <input type="text" id="concept" value="${newCampaignData.concept || ''}" 
                                placeholder="e.g., Cheapest Basket, Mixed Route, Free Delivery"
                                class="w-full px-4 py-2 border rounded-lg">
                        </div>
                    </div>
                    <div class="flex justify-between mt-6">
                        <button onclick="prevWizardStep()" class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                            ← Previous
                        </button>
                        <button onclick="nextWizardStep()" class="bg-gradient-to-r from-rappn-green to-rappn-blue text-white px-6 py-2 rounded-lg hover:opacity-90">
                            Next Step →
                        </button>
                    </div>
                </div>
            `;
        case 3:
            return `
                <div>
                    <h3 class="text-xl font-bold mb-4">Step 3: Targeting</h3>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Geography *</label>
                                <select id="geo" class="w-full px-4 py-2 border rounded-lg">
                                    <option value="">Select region...</option>
                                    <option value="ZH" ${newCampaignData.geo === 'ZH' ? 'selected' : ''}>Zurich (ZH)</option>
                                    <option value="GE" ${newCampaignData.geo === 'GE' ? 'selected' : ''}>Geneva (GE)</option>
                                    <option value="BE" ${newCampaignData.geo === 'BE' ? 'selected' : ''}>Bern (BE)</option>
                                    <option value="BS" ${newCampaignData.geo === 'BS' ? 'selected' : ''}>Basel (BS)</option>
                                    <option value="CH" ${newCampaignData.geo === 'CH' ? 'selected' : ''}>All Switzerland</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Language *</label>
                                <select id="language" class="w-full px-4 py-2 border rounded-lg">
                                    <option value="">Select language...</option>
                                    <option value="DE" ${newCampaignData.language === 'DE' ? 'selected' : ''}>German</option>
                                    <option value="FR" ${newCampaignData.language === 'FR' ? 'selected' : ''}>French</option>
                                    <option value="IT" ${newCampaignData.language === 'IT' ? 'selected' : ''}>Italian</option>
                                    <option value="EN" ${newCampaignData.language === 'EN' ? 'selected' : ''}>English</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between mt-6">
                        <button onclick="prevWizardStep()" class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                            ← Previous
                        </button>
                        <button onclick="nextWizardStep()" class="bg-gradient-to-r from-rappn-green to-rappn-blue text-white px-6 py-2 rounded-lg hover:opacity-90">
                            Review →
                        </button>
                    </div>
                </div>
            `;
        case 4:
            return `
                <div>
                    <h3 class="text-xl font-bold mb-4">Step 4: Review & Create</h3>
                    <div class="bg-gray-50 rounded-lg p-6 mb-6">
                        <h4 class="font-semibold mb-3">Campaign Summary</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div><span class="text-gray-600">Name:</span> <span class="font-medium">${newCampaignData.name || 'N/A'}</span></div>
                            <div><span class="text-gray-600">Concept:</span> <span class="font-medium">${newCampaignData.concept || 'N/A'}</span></div>
                            <div><span class="text-gray-600">Start Date:</span> <span class="font-medium">${newCampaignData.date_start || 'N/A'}</span></div>
                            <div><span class="text-gray-600">End Date:</span> <span class="font-medium">${newCampaignData.date_end || 'N/A'}</span></div>
                            <div><span class="text-gray-600">Channel:</span> <span class="font-medium">${newCampaignData.primary_channel || 'N/A'}</span></div>
                            <div><span class="text-gray-600">Type:</span> <span class="font-medium">${newCampaignData.type || 'N/A'}</span></div>
                            <div><span class="text-gray-600">Geography:</span> <span class="font-medium">${newCampaignData.geo || 'N/A'}</span></div>
                            <div><span class="text-gray-600">Language:</span> <span class="font-medium">${newCampaignData.language || 'N/A'}</span></div>
                        </div>
                    </div>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p class="text-sm text-blue-800">
                            <strong>Campaign ID will be generated:</strong><br>
                            Format: YYYY-MM_GEO-CHAN-TYPE-CONCEPT-LANG
                        </p>
                    </div>
                    <div class="flex justify-between mt-6">
                        <button onclick="prevWizardStep()" class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                            ← Previous
                        </button>
                        <button onclick="createCampaign()" class="bg-gradient-to-r from-rappn-green to-rappn-blue text-white px-6 py-2 rounded-lg hover:opacity-90">
                            🚀 Create Campaign
                        </button>
                    </div>
                </div>
            `;
    }
}

function renderPerformance() {
    // Show overall analytics if no campaign is selected
    if (!selectedCampaign) {
        // Filter campaigns based on status
        const filteredCampaigns = campaigns.filter(c => {
            if (campaignFilter === 'active') return c.status === 'active';
            if (campaignFilter === 'inactive') return c.status === 'inactive';
            return true; // 'all'
        });

        return `
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold text-gray-900">Performance Overview</h2>
                    <div class="flex gap-3">
                        <!-- Status Filter -->
                        <select onchange="campaignFilter = this.value; switchView('performance')" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rappn-green">
                            <option value="active" ${campaignFilter === 'active' ? 'selected' : ''}>Active Only</option>
                            <option value="inactive" ${campaignFilter === 'inactive' ? 'selected' : ''}>Inactive Only</option>
                            <option value="all" ${campaignFilter === 'all' ? 'selected' : ''}>All Campaigns</option>
                        </select>
                    </div>
                </div>
                
                <!-- Loading state -->
                ${!overviewAnalytics ? `
                    <div class="bg-white rounded-2xl shadow-md p-8 text-center">
                        <div class="text-4xl mb-4">📊</div>
                        <p class="text-gray-500">Loading analytics...</p>
                    </div>
                ` : `
                    <!-- Summary Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-md p-6 text-white">
                            <div class="text-sm opacity-90 mb-2">Total Clicks</div>
                            <div class="text-4xl font-bold">${overviewAnalytics.summary.total_clicks.toLocaleString()}</div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md p-6 text-white">
                            <div class="text-sm opacity-90 mb-2">Total Campaigns</div>
                            <div class="text-4xl font-bold">${overviewAnalytics.summary.total_campaigns}</div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-md p-6 text-white">
                            <div class="text-sm opacity-90 mb-2">Active Campaigns</div>
                            <div class="text-4xl font-bold">${overviewAnalytics.summary.active_campaigns}</div>
                        </div>
                        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-md p-6 text-white">
                            <div class="text-sm opacity-90 mb-2">Channels</div>
                            <div class="text-4xl font-bold">${overviewAnalytics.summary.channels}</div>
                        </div>
                    </div>

                    <!-- Campaign Selector Dropdown -->
                    <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
                        <h3 class="text-xl font-bold mb-4">Select Campaign to Analyze</h3>
                        <select onchange="if(this.value) viewCampaignAnalytics(this.value)" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rappn-green text-lg">
                            <option value="">-- Select a Campaign --</option>
                            ${filteredCampaigns.map(c => `
                                <option value="${c.campaign_id}">
                                    ${c.name} (${c.campaign_id}) - ${c.status.toUpperCase()}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <!-- Charts Row 1 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <!-- Clicks Over Time -->
                        <div class="bg-white rounded-2xl shadow-md p-6">
                            <h3 class="text-xl font-bold mb-4">Clicks Over Time (Last 30 Days)</h3>
                            <div style="height: 300px; position: relative;">
                                <canvas id="clicksOverTimeChart"></canvas>
                            </div>
                        </div>

                        <!-- Clicks by Channel -->
                        <div class="bg-white rounded-2xl shadow-md p-6">
                            <h3 class="text-xl font-bold mb-4">Clicks by Channel</h3>
                            <div style="height: 300px; position: relative;">
                                <canvas id="clicksByChannelChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Row 2 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <!-- Clicks by Hour -->
                        <div class="bg-white rounded-2xl shadow-md p-6">
                            <h3 class="text-xl font-bold mb-4">Clicks by Hour (Today)</h3>
                            <div style="height: 300px; position: relative;">
                                <canvas id="clicksByHourChart"></canvas>
                            </div>
                        </div>

                        <!-- Top Campaigns -->
                        <div class="bg-white rounded-2xl shadow-md p-6">
                            <h3 class="text-xl font-bold mb-4">Top Campaigns by Clicks</h3>
                            <div class="space-y-3" style="height: 300px; overflow-y: auto;">
                                ${overviewAnalytics.clicks_by_campaign.slice(0, 10).map((c, i) => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="viewCampaignAnalytics('${c.campaign_id}')">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-rappn-green to-rappn-blue text-white flex items-center justify-center font-bold text-sm">
                                                ${i + 1}
                                            </div>
                                            <div>
                                                <div class="font-semibold">${c.campaign_name}</div>
                                                <div class="text-xs text-gray-500">${c.channels.join(', ')}</div>
                                            </div>
                                        </div>
                                        <div class="text-2xl font-bold text-rappn-green">${c.clicks}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    // Show campaign-specific analytics
    return `
        <div class="p-6">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <button onclick="selectedCampaign = null; campaignAnalytics = null; currentView = 'performance'; renderApp();" class="text-rappn-blue hover:underline mb-2">
                        ← Back to Overview
                    </button>
                    <h2 class="text-3xl font-bold text-gray-900">${selectedCampaign.name}</h2>
                    <p class="text-gray-600 mt-1">${selectedCampaign.campaign_id} - <span class="font-semibold ${selectedCampaign.status === 'active' ? 'text-green-600' : 'text-gray-500'}">${selectedCampaign.status.toUpperCase()}</span></p>
                </div>
                <div class="flex gap-3">
                    <button onclick="toggleCampaignStatus('${selectedCampaign.campaign_id}')" class="px-4 py-2 ${selectedCampaign.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition">
                        ${selectedCampaign.status === 'active' ? 'Set Inactive' : 'Set Active'}
                    </button>
                    <button onclick="deleteCampaign('${selectedCampaign.campaign_id}')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                        Delete Campaign
                    </button>
                    <button onclick="switchView('campaign-detail')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        Edit Details
                    </button>
                </div>
            </div>

            ${!campaignAnalytics ? `
                <div class="bg-white rounded-2xl shadow-md p-8 text-center">
                    <div class="text-4xl mb-4">📊</div>
                    <p class="text-gray-500">Loading campaign analytics...</p>
                </div>
            ` : `
                <!-- Summary Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-md p-6 text-white">
                        <div class="text-sm opacity-90 mb-2">Total Clicks</div>
                        <div class="text-4xl font-bold">${campaignAnalytics.summary.total_clicks.toLocaleString()}</div>
                    </div>
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md p-6 text-white">
                        <div class="text-sm opacity-90 mb-2">Placements</div>
                        <div class="text-4xl font-bold">${campaignAnalytics.summary.total_placements}</div>
                    </div>
                    <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-md p-6 text-white">
                        <div class="text-sm opacity-90 mb-2">Channels</div>
                        <div class="text-4xl font-bold">${campaignAnalytics.summary.channels}</div>
                    </div>
                    <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-md p-6 text-white">
                        <div class="text-sm opacity-90 mb-2">Status</div>
                        <div class="text-2xl font-bold">${campaignAnalytics.campaign.status.toUpperCase()}</div>
                    </div>
                </div>

                <!-- Charts Row 1 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Clicks Over Time -->
                    <div class="bg-white rounded-2xl shadow-md p-6">
                        <h3 class="text-xl font-bold mb-4">Clicks Over Time</h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="campaignClicksOverTimeChart"></canvas>
                        </div>
                    </div>

                    <!-- Clicks by Channel -->
                    <div class="bg-white rounded-2xl shadow-md p-6">
                        <h3 class="text-xl font-bold mb-4">Clicks by Channel</h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="campaignClicksByChannelChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Charts Row 2 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Clicks by Hour -->
                    <div class="bg-white rounded-2xl shadow-md p-6">
                        <h3 class="text-xl font-bold mb-4">Clicks by Hour</h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="campaignClicksByHourChart"></canvas>
                        </div>
                    </div>

                    <!-- Clicks by Day of Week -->
                    <div class="bg-white rounded-2xl shadow-md p-6">
                        <h3 class="text-xl font-bold mb-4">Clicks by Day of Week</h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="campaignClicksByDayChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Placement Performance Table -->
                <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
                    <h3 class="text-xl font-bold mb-4">Placement Performance</h3>
                    ${campaignAnalytics.clicks_by_placement.length === 0 ? `
                        <p class="text-center py-8 text-gray-500">No placements created yet</p>
                    ` : `
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Placement ID</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Channel</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ad Type</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Clicks</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Performance</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y">
                                    ${campaignAnalytics.clicks_by_placement
                                        .sort((a, b) => b.clicks - a.clicks)
                                        .map(p => {
                                            const maxClicks = Math.max(...campaignAnalytics.clicks_by_placement.map(pl => pl.clicks));
                                            const percentage = maxClicks > 0 ? (p.clicks / maxClicks) * 100 : 0;
                                            return `
                                                <tr class="hover:bg-gray-50">
                                                    <td class="px-4 py-3 font-medium">#${p.placement_id}</td>
                                                    <td class="px-4 py-3">${p.channel}</td>
                                                    <td class="px-4 py-3">
                                                        <span class="px-2 py-1 bg-gray-100 rounded text-xs">${p.ad_type}</span>
                                                    </td>
                                                    <td class="px-4 py-3">
                                                        <span class="text-2xl font-bold text-rappn-green">${p.clicks}</span>
                                                    </td>
                                                    <td class="px-4 py-3">
                                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                                            <div class="bg-gradient-to-r from-rappn-green to-rappn-blue h-2 rounded-full" style="width: ${percentage}%"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>

                <!-- Recent Clicks -->
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <h3 class="text-xl font-bold mb-4">Recent Clicks</h3>
                    ${campaignAnalytics.recent_clicks.length === 0 ? `
                        <p class="text-center py-8 text-gray-500">No clicks yet</p>
                    ` : `
                        <div class="space-y-2">
                            ${campaignAnalytics.recent_clicks.map(click => `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div class="flex items-center space-x-3">
                                        <div class="text-2xl">${click.channel === 'facebook' ? '📘' : click.channel === 'instagram' ? '📷' : click.channel === 'google' ? '🔍' : '🔗'}</div>
                                        <div>
                                            <div class="font-medium">${click.channel} - ${click.utm_content}</div>
                                            <div class="text-xs text-gray-500">${new Date(click.timestamp).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div class="text-xs text-gray-400">${click.ip}</div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            `}
        </div>
    `;
}

// Navigation
window.switchView = async function(view) {
    currentView = view;
    
    // Load analytics data when switching to performance view
    if (view === 'performance') {
        if (!selectedCampaign) {
            // Load overview analytics
            overviewAnalytics = null;
            renderApp();
            await loadOverviewAnalytics();
            renderApp();
        }
    } else {
        // Clear analytics and charts when leaving performance view
        destroyCharts();
        overviewAnalytics = null;
        campaignAnalytics = null;
    }
    
    if (view !== 'campaign-detail' && view !== 'performance') {
        selectedCampaign = null;
    }
    
    renderApp();
};

function generateQRCodes() {
    if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
        return;
    }
    
    console.log('Generating QR codes for', placements.length, 'placements');
    
    placements.forEach(p => {
        const container = document.getElementById(`qr-${p.id}`);
        if (container) {
            // Clear any existing QR code
            container.innerHTML = '';
            try {
                // Use tracked_url for QR codes to log every scan
                const qrTarget = p.tracked_url || p.final_url || '';
                console.log('Creating QR code for placement', p.id, 'with tracked URL:', qrTarget);
                new QRCode(container, {
                    text: qrTarget,
                    width: 180,
                    height: 180,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                });
            } catch (error) {
                console.error('Error generating QR code for placement', p.id, ':', error);
            }
        } else {
            console.warn('QR container not found for placement', p.id);
        }
    });
}

// Load overview analytics
async function loadOverviewAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics/overview`);
        if (!response.ok) throw new Error('Failed to load overview analytics');
        overviewAnalytics = await response.json();
        console.log('Overview analytics loaded:', overviewAnalytics);
    } catch (error) {
        console.error('Error loading overview analytics:', error);
        alert('Failed to load performance data');
    }
}

// Load campaign-specific analytics
async function loadCampaignAnalytics(campaign_id) {
    try {
        const response = await fetch(`${API_BASE}/analytics/campaign/${campaign_id}`);
        if (!response.ok) throw new Error('Failed to load campaign analytics');
        campaignAnalytics = await response.json();
        console.log('Campaign analytics loaded:', campaignAnalytics);
    } catch (error) {
        console.error('Error loading campaign analytics:', error);
        alert('Failed to load campaign performance data');
    }
}

// View campaign analytics
async function viewCampaignAnalytics(campaign_id) {
    const campaign = campaigns.find(c => c.campaign_id === campaign_id);
    if (!campaign) return;
    
    selectedCampaign = campaign;
    campaignAnalytics = null; // Reset to show loading state
    currentView = 'performance';
    renderApp();
    
    // Load analytics data
    await loadCampaignAnalytics(campaign_id);
    renderApp();
}

// Destroy all charts to prevent memory leaks
function destroyCharts() {
    Object.keys(charts).forEach(key => {
        if (charts[key]) {
            charts[key].destroy();
            delete charts[key];
        }
    });
}

// Render charts after the DOM is updated
function renderCharts() {
    // Destroy existing charts first
    destroyCharts();

    if (!selectedCampaign && overviewAnalytics) {
        // Overview charts
        renderOverviewCharts();
    } else if (selectedCampaign && campaignAnalytics) {
        // Campaign-specific charts
        renderCampaignCharts();
    }
}

// Render overview charts
function renderOverviewCharts() {
    // Clicks over time
    const clicksOverTimeCanvas = document.getElementById('clicksOverTimeChart');
    if (clicksOverTimeCanvas) {
        const dates = overviewAnalytics.clicks_by_date.map(d => d.date);
        const clicks = overviewAnalytics.clicks_by_date.map(d => d.clicks);
        
        charts.clicksOverTime = new Chart(clicksOverTimeCanvas, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Clicks',
                    data: clicks,
                    borderColor: '#3aaa35',
                    backgroundColor: 'rgba(58, 170, 53, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Clicks by channel
    const clicksByChannelCanvas = document.getElementById('clicksByChannelChart');
    if (clicksByChannelCanvas) {
        if (overviewAnalytics.clicks_by_channel.length > 0) {
            const channels = overviewAnalytics.clicks_by_channel.map(c => c.channel);
            const clicks = overviewAnalytics.clicks_by_channel.map(c => c.clicks);
            
            charts.clicksByChannel = new Chart(clicksByChannelCanvas, {
                type: 'doughnut',
                data: {
                    labels: channels,
                    datasets: [{
                        data: clicks,
                        backgroundColor: [
                            '#3aaa35',
                            '#18a19a',
                            '#fbbf24',
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12 },
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 },
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Clicks by hour
    const clicksByHourCanvas = document.getElementById('clicksByHourChart');
    if (clicksByHourCanvas) {
        if (overviewAnalytics.clicks_by_hour.length > 0) {
            const hours = overviewAnalytics.clicks_by_hour.map(h => `${h.hour}:00`);
            const clicks = overviewAnalytics.clicks_by_hour.map(h => h.clicks);
            
            charts.clicksByHour = new Chart(clicksByHourCanvas, {
                type: 'bar',
                data: {
                    labels: hours,
                    datasets: [{
                        label: 'Clicks',
                        data: clicks,
                        backgroundColor: '#18a19a',
                        borderRadius: 6,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                font: { size: 11 }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                font: { size: 11 }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }
}

// Render campaign-specific charts
function renderCampaignCharts() {
    // Clicks over time
    const clicksOverTimeCanvas = document.getElementById('campaignClicksOverTimeChart');
    if (clicksOverTimeCanvas) {
        const dates = campaignAnalytics.clicks_by_date.map(d => d.date);
        const clicks = campaignAnalytics.clicks_by_date.map(d => d.clicks);
        
        charts.campaignClicksOverTime = new Chart(clicksOverTimeCanvas, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Clicks',
                    data: clicks,
                    borderColor: '#3aaa35',
                    backgroundColor: 'rgba(58, 170, 53, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Clicks by channel
    const clicksByChannelCanvas = document.getElementById('campaignClicksByChannelChart');
    if (clicksByChannelCanvas) {
        if (campaignAnalytics.clicks_by_channel.length > 0) {
            const channels = campaignAnalytics.clicks_by_channel.map(c => c.channel);
            const clicks = campaignAnalytics.clicks_by_channel.map(c => c.clicks);
            
            charts.campaignClicksByChannel = new Chart(clicksByChannelCanvas, {
                type: 'doughnut',
                data: {
                    labels: channels,
                    datasets: [{
                        data: clicks,
                        backgroundColor: [
                            '#3aaa35',
                            '#18a19a',
                            '#fbbf24',
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12 },
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 },
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Clicks by hour
    const clicksByHourCanvas = document.getElementById('campaignClicksByHourChart');
    if (clicksByHourCanvas) {
        if (campaignAnalytics.clicks_by_hour.length > 0) {
            const hours = campaignAnalytics.clicks_by_hour.map(h => `${h.hour}:00`);
            const clicks = campaignAnalytics.clicks_by_hour.map(h => h.clicks);
            
            charts.campaignClicksByHour = new Chart(clicksByHourCanvas, {
                type: 'bar',
                data: {
                    labels: hours,
                    datasets: [{
                        label: 'Clicks',
                        data: clicks,
                        backgroundColor: '#18a19a',
                        borderRadius: 6,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                font: { size: 11 }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                font: { size: 11 }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    // Clicks by day of week
    const clicksByDayCanvas = document.getElementById('campaignClicksByDayChart');
    if (clicksByDayCanvas) {
        if (campaignAnalytics.clicks_by_day_of_week.length > 0) {
            const days = campaignAnalytics.clicks_by_day_of_week.map(d => d.day_of_week);
            const clicks = campaignAnalytics.clicks_by_day_of_week.map(d => d.clicks);
            
            charts.campaignClicksByDay = new Chart(clicksByDayCanvas, {
                type: 'bar',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Clicks',
                        data: clicks,
                        backgroundColor: '#3aaa35',
                        borderRadius: 6,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                font: { size: 11 }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                font: { size: 11 }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }
}

window.viewCampaign = async function(campaignId) {
    selectedCampaign = campaigns.find(c => c.campaign_id === campaignId);
    if (!selectedCampaign) return;
    
    try {
        const response = await fetch(`${API_BASE}/tracking/placements/${campaignId}`);
        placements = await response.json();
    } catch (error) {
        console.error('Error loading placements:', error);
        placements = [];
    }
    
    currentView = 'campaign-detail';
    renderApp();
};

window.showPlacementForm = function() {
    document.getElementById('placement-form').classList.remove('hidden');
};

window.hidePlacementForm = function() {
    document.getElementById('placement-form').classList.add('hidden');
};

window.createPlacement = async function() {
    const data = {
        campaign_id: selectedCampaign.campaign_id,
        placement_id_seq: placements.length + 1,
        channel: document.getElementById('channel').value,
        ad_type: document.getElementById('adtype').value,
        medium: document.getElementById('medium').value,
        base_url: document.getElementById('baseurl').value,
        geo: selectedCampaign.geo,
        language: selectedCampaign.language,
        concept: selectedCampaign.concept
    };
    
    try {
        const response = await fetch(`${API_BASE}/tracking/build-placement-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            await viewCampaign(selectedCampaign.campaign_id);
            alert('Placement created successfully! Use "Open & Track" to test, or copy the link to share.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create placement');
    }
};

window.copyUrl = function(url) {
    if (!url) {
        alert('Tracking URL is not available yet. Please try again in a moment.');
        return;
    }
    navigator.clipboard.writeText(url).then(() => {
        alert('URL copied to clipboard!');
    });
};

window.openTrackedUrl = function(url) {
    if (!url) {
        alert('Tracking URL is not available yet. Please refresh the page.');
        return;
    }
    window.open(url, '_blank');
};

// Campaign Wizard Functions
window.showNewCampaignWizard = function() {
    wizardStep = 1;
    newCampaignData = {};
    currentView = 'new-campaign';
    renderApp();
};

window.nextWizardStep = function() {
    // Capture current step data
    if (wizardStep === 1) {
        newCampaignData.name = document.getElementById('campaign-name').value;
        newCampaignData.date_start = document.getElementById('start-date').value;
        newCampaignData.date_end = document.getElementById('end-date').value;
        newCampaignData.description = document.getElementById('description').value;
        
        if (!newCampaignData.name || !newCampaignData.date_start || !newCampaignData.date_end) {
            alert('Please fill in all required fields');
            return;
        }
    } else if (wizardStep === 2) {
        newCampaignData.primary_channel = document.getElementById('primary-channel').value;
        newCampaignData.type = document.getElementById('campaign-type').value;
        newCampaignData.concept = document.getElementById('concept').value;
        
        if (!newCampaignData.primary_channel || !newCampaignData.type || !newCampaignData.concept) {
            alert('Please fill in all required fields');
            return;
        }
    } else if (wizardStep === 3) {
        newCampaignData.geo = document.getElementById('geo').value;
        newCampaignData.language = document.getElementById('language').value;
        
        if (!newCampaignData.geo || !newCampaignData.language) {
            alert('Please fill in all required fields');
            return;
        }
    }
    
    wizardStep++;
    renderApp();
};

window.prevWizardStep = function() {
    wizardStep--;
    renderApp();
};

window.createCampaign = async function() {
    try {
        // Generate campaign ID
        const idResponse = await fetch(`${API_BASE}/ids/campaign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dateStart: newCampaignData.date_start,
                geo: newCampaignData.geo,
                primaryChannel: newCampaignData.primary_channel,
                type: newCampaignData.type,
                concept: newCampaignData.concept,
                language: newCampaignData.language,
            })
        });
        
        const { campaign_id } = await idResponse.json();
        
        // Create campaign
        const campaignResponse = await fetch(`${API_BASE}/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newCampaignData,
                campaign_id,
                status: 'draft'
            })
        });
        
        if (campaignResponse.ok) {
            alert('Campaign created successfully!');
            wizardStep = 1;
            newCampaignData = {};
            await loadCampaigns();
            switchView('dashboard');
        } else {
            alert('Failed to create campaign');
        }
    } catch (error) {
        console.error('Error creating campaign:', error);
        alert('Failed to create campaign');
    }
};

// Performance tracking (updated to use new analytics endpoints)
window.viewPerformance = async function(campaignId) {
    await viewCampaignAnalytics(campaignId);
};

// Toggle campaign status between active and inactive
window.toggleCampaignStatus = async function(campaignId) {
    const campaign = campaigns.find(c => c.campaign_id === campaignId);
    if (!campaign) return;
    
    const newStatus = campaign.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = `Are you sure you want to set this campaign to ${newStatus.toUpperCase()}?`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        const response = await fetch(`${API_BASE}/campaigns/${campaignId}/status`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            alert(`Campaign status updated to ${newStatus.toUpperCase()}`);
            // Reload campaigns and refresh view
            await loadCampaigns();
            if (currentView === 'performance' && selectedCampaign && selectedCampaign.campaign_id === campaignId) {
                selectedCampaign = campaigns.find(c => c.campaign_id === campaignId);
                campaignAnalytics = null;
                renderApp();
                await loadCampaignAnalytics(campaignId);
                renderApp();
            } else {
                renderApp();
            }
        } else {
            alert('Failed to update campaign status');
        }
    } catch (error) {
        console.error('Error toggling campaign status:', error);
        alert('Failed to update campaign status');
    }
};

// Delete campaign (soft delete - sets to inactive)
window.deleteCampaign = async function(campaignId) {
    const campaign = campaigns.find(c => c.campaign_id === campaignId);
    if (!campaign) return;
    
    const confirmMsg = `Are you sure you want to DELETE "${campaign.name}"?\n\nThis will:\n- Set the campaign to INACTIVE\n- Keep all data in Google Sheets\n- Remove it from the campaign list\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        const response = await fetch(`${API_BASE}/campaigns/${campaignId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Campaign deleted successfully');
            // Reload campaigns and go to dashboard
            await loadCampaigns();
            switchView('dashboard');
        } else {
            alert('Failed to delete campaign');
        }
    } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign');
    }
};

window.testClick = async function(placementId, url, campaignId) {
    try {
        await fetch(`${API_BASE}/tracking/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                placement_id: placementId,
                campaign_id: campaignId,
                url: url
            })
        });
        alert('Click recorded! Check the Performance tab to see updated analytics.');
    } catch (error) {
        console.error('Error recording click:', error);
        alert('Failed to record click');
    }
};

window.downloadQR = function(qrElementId, qrId) {
    const qrElement = document.getElementById(qrElementId);
    if (!qrElement) return;
    
    const canvas = qrElement.querySelector('canvas');
    if (!canvas) return;
    
    // Create a new canvas with branding
    const brandedCanvas = document.createElement('canvas');
    const ctx = brandedCanvas.getContext('2d');
    const size = 600;
    brandedCanvas.width = size;
    brandedCanvas.height = size + 120; // Extra space for branding
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size + 120);
    
    // Draw Rappn branding at top
    ctx.fillStyle = '#3aaa35';
    ctx.fillRect(0, 0, size, 80);
    
    // Rappn logo/text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RAPPN', size / 2, 55);
    
    // Draw QR code (larger for better scanning)
    const qrSize = 480;
    const qrPadding = (size - qrSize) / 2;
    ctx.drawImage(canvas, qrPadding, 100, qrSize, qrSize);
    
    // QR ID at bottom
    ctx.fillStyle = '#333333';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(qrId, size / 2, size + 105);
    
    // Download
    brandedCanvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${qrId}.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
};
