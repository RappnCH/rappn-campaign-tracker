// Rappn Marketing Campaign Manager
console.log('App starting...');

const API_BASE = 'http://localhost:3000';
let campaigns = [];
let currentView = 'dashboard';
let selectedCampaign = null;
let placements = [];
let campaignAnalytics = null;
let wizardStep = 1;
let newCampaignData = {};

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
    return `
        <div class="p-6">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Campaign Dashboard</h2>
            
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Total Campaigns</div>
                    <div class="text-3xl font-bold text-gray-900">${campaigns.length}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Active</div>
                    <div class="text-3xl font-bold text-green-600">${campaigns.filter(c => c.status === 'active').length}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Draft</div>
                    <div class="text-3xl font-bold text-blue-600">${campaigns.filter(c => c.status === 'draft').length}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">This Month</div>
                    <div class="text-3xl font-bold text-purple-600">${campaigns.length}</div>
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
                            ${campaigns.map(campaign => `
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
                                        <button onclick="viewCampaign('${campaign.campaign_id}')" class="text-rappn-blue hover:underline text-sm font-medium">
                                            View Details →
                                        </button>
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
                                <div class="flex gap-2">
                                    <input type="text" value="${p.final_url || p.tracked_url}" readonly class="flex-1 px-3 py-2 bg-gray-50 border rounded text-sm font-mono">
                                    <button onclick="copyUrl('${p.final_url || p.tracked_url}')" class="px-4 py-2 bg-rappn-green text-white rounded hover:opacity-90">Copy</button>
                                    <button onclick="openTrackedUrl('${p.tracked_url || p.final_url}')" class="px-4 py-2 bg-blue-500 text-white rounded hover:opacity-90">Open & Track</button>
                                </div>
                                ${p.tracked_url ? `<div class="text-xs text-gray-500">Tracking redirect: <span class="font-mono">${p.tracked_url}</span></div>` : ''}
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
    console.log('renderPerformance called');
    console.log('selectedCampaign:', selectedCampaign);
    console.log('campaignAnalytics:', campaignAnalytics);
    
    if (!selectedCampaign || !campaignAnalytics) {
        console.log('No campaign or analytics, showing selection page');
        return `
            <div class="p-6">
                <h2 class="text-3xl font-bold text-gray-900 mb-6">Campaign Performance</h2>
                <div class="bg-white rounded-2xl shadow-md p-8">
                    <p class="text-gray-500 mb-6 text-center">Select a campaign to view its performance analytics</p>
                    
                    ${campaigns.length === 0 ? `
                        <p class="text-center text-gray-400">No campaigns available</p>
                    ` : `
                        <div class="grid grid-cols-1 gap-4">
                            ${campaigns.map(c => `
                                <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onclick="viewPerformance('${c.campaign_id}')">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h3 class="font-semibold text-lg">${c.name}</h3>
                                            <p class="text-sm text-gray-500">${c.campaign_id}</p>
                                        </div>
                                        <button class="px-4 py-2 bg-gradient-to-r from-rappn-green to-rappn-blue text-white rounded-lg hover:opacity-90">
                                            View Analytics →
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    const totalClicks = campaignAnalytics.total_clicks || 0;
    const totalPlacements = campaignAnalytics.total_placements || 0;
    const avgClicksPerPlacement = totalPlacements > 0 ? (totalClicks / totalPlacements).toFixed(1) : 0;
    
    console.log('Rendering analytics with:', { totalClicks, totalPlacements, avgClicksPerPlacement });

    return `
        <div class="p-6">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900">${selectedCampaign.name}</h2>
                    <p class="text-gray-600 mt-1">Performance Analytics</p>
                </div>
                <button onclick="switchView('campaign-detail')" class="text-rappn-blue hover:underline">
                    ← Back to Campaign
                </button>
            </div>

            <!-- Key Metrics -->
            <div class="grid grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Total Clicks</div>
                    <div class="text-3xl font-bold text-rappn-green">${totalClicks}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Placements</div>
                    <div class="text-3xl font-bold text-blue-600">${totalPlacements}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Avg Clicks/Placement</div>
                    <div class="text-3xl font-bold text-purple-600">${avgClicksPerPlacement}</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Status</div>
                    <div class="text-lg font-bold ${selectedCampaign.status === 'active' ? 'text-green-600' : 'text-blue-600'}">${selectedCampaign.status.toUpperCase()}</div>
                </div>
            </div>

            <!-- Placement Breakdown -->
            <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4">Click Trend (Last 7 Days)</h3>
                <div class="h-64 flex items-center justify-center">
                    ${totalClicks === 0 ? `
                        <div class="text-center">
                            <div class="text-6xl mb-4">📊</div>
                            <p class="text-gray-500">No click data yet</p>
                            <p class="text-sm text-gray-400 mt-2">Start tracking links to see performance charts</p>
                        </div>
                    ` : `
                        <div class="w-full h-full flex items-end justify-around gap-2 pb-4">
                            ${Array.from({length: 7}, (_, i) => {
                                const dayClicks = Math.floor(totalClicks / 7) + (i === 6 ? totalClicks % 7 : 0);
                                const height = totalClicks > 0 ? Math.max(20, (dayClicks / totalClicks) * 200) : 20;
                                return `
                                    <div class="flex flex-col items-center flex-1">
                                        <div class="w-full bg-gradient-to-t from-rappn-green to-rappn-blue rounded-t" style="height: ${height}px;"></div>
                                        <div class="text-xs mt-2 text-gray-600">${dayClicks}</div>
                                        <div class="text-xs text-gray-400">Day ${i + 1}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>

            <!-- Placement Breakdown -->
            <div class="bg-white rounded-2xl shadow-md p-6">
                <h3 class="text-xl font-bold mb-4">Placement Performance</h3>
                ${campaignAnalytics.placements.length === 0 ? `
                    <p class="text-center py-8 text-gray-500">No placements created yet</p>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Placement</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Channel</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ad Type</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medium</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">Clicks</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">URL</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                ${campaignAnalytics.placements.map(p => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-3 font-medium">#${p.placement_id}</td>
                                        <td class="px-4 py-3">${p.channel}</td>
                                        <td class="px-4 py-3">${p.ad_type}</td>
                                        <td class="px-4 py-3">
                                            <span class="px-2 py-1 bg-gray-100 rounded text-xs">${p.medium}</span>
                                        </td>
                                        <td class="px-4 py-3">
                                            <span class="text-lg font-bold text-rappn-green">${p.clicks}</span>
                                        </td>
                                        <td class="px-4 py-3">
                                            <button onclick="copyUrl('${p.tracked_url || p.final_url}')" class="text-rappn-blue hover:underline text-sm">
                                                Copy Link
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Navigation
window.switchView = function(view) {
    currentView = view;
    selectedCampaign = null;
    campaignAnalytics = null;
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
                // Use final_url directly for QR codes to avoid redirect delay
                // The final_url includes all UTM parameters for tracking
                const qrTarget = p.final_url || '';
                console.log('Creating QR code for placement', p.id, 'with final URL:', qrTarget);
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

// Performance tracking
window.viewPerformance = async function(campaignId) {
    console.log('Loading performance for campaign:', campaignId);
    selectedCampaign = campaigns.find(c => c.campaign_id === campaignId);
    if (!selectedCampaign) {
        console.error('Campaign not found:', campaignId);
        return;
    }
    
    try {
        console.log('Fetching analytics from:', `${API_BASE}/analytics/campaign/${campaignId}`);
        const response = await fetch(`${API_BASE}/analytics/campaign/${campaignId}`);
        const data = await response.json();
        campaignAnalytics = data;
        console.log('Analytics loaded successfully:', data);
        console.log('Total clicks:', data.total_clicks);
        console.log('Placements:', data.placements);
    } catch (error) {
        console.error('Error loading analytics:', error);
        campaignAnalytics = { total_clicks: 0, total_placements: 0, placements: [] };
    }
    
    currentView = 'performance';
    console.log('Switching to performance view, campaignAnalytics:', campaignAnalytics);
    renderApp();
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
