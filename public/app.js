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
let reactivatingCampaign = null; // For the reactivation modal
let clicksTimeframe = 'daily'; // 'daily', 'weekly', or 'monthly'

let cockpitTimeRange = '30d'; // Default time range
let cockpitDevMode = false; // Toggle for showing endpoints
let cockpitModal = null; // Current open modal
let cockpitCanton = 'all'; // Default canton filter
let growthGranularity = 'daily'; // 'daily', 'weekly', 'monthly'

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
                    <img src="/logo.svg" alt="Rappn Logo" class="h-12 w-auto bg-white rounded-lg p-1">
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
                    <button onclick="switchView('ceo-cockpit')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${currentView === 'ceo-cockpit' ? 'bg-gradient-to-r from-rappn-green to-rappn-blue text-white' : 'text-gray-700 hover:bg-gray-100'}">
                        <span>🚀</span>
                        <span class="font-medium">CEO Cockpit</span>
                    </button>
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
                    <button onclick="switchView('archive')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${currentView === 'archive' ? 'bg-gradient-to-r from-rappn-green to-rappn-blue text-white' : 'text-gray-700 hover:bg-gray-100'}">
                        <span>🗄️</span>
                        <span class="font-medium">Archive</span>
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

    // Render Charts if Modal is Open
    if (cockpitModal) {
        setTimeout(() => {
            renderCockpitModalCharts();
        }, 100);
    }
    
    // Generate QR codes after DOM is updated
    if (currentView === 'campaign-detail' && placements.length > 0) {
        setTimeout(() => {
            console.log('Attempting to generate QR codes...');
            generateQRCodes();
        }, 200);
    }
    
    // Render charts after DOM is updated
    if (currentView === 'performance' || currentView === 'ceo-cockpit') {
        setTimeout(() => {
            console.log('Attempting to render charts...');
            if (currentView === 'performance') renderCharts();
            if (currentView === 'ceo-cockpit') renderCEOCockpitCharts();
        }, 200);
    }
}

function renderCurrentView() {
    switch(currentView) {
        case 'ceo-cockpit':
            return renderCEOCockpit();
        case 'dashboard':
            return renderDashboard();
        case 'campaign-detail':
            return renderCampaignDetail();
        case 'performance':
            return renderPerformance();
        case 'archive':
            return renderArchive();
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

function renderCEOCockpit() {
    // Fake Data Initialization
    const growthData = {
        downloads: 12450,
        wau: 2150,
        retention: 14.2,
        liveUsers: 345
    };

    const viralData = {
        listsShared: 850,
        listsAccepted: 480,
        conversionRate: 56.4
    };

    const engagementData = {
        genericAdded: 15000,
        offersAdded: 12500,
        offersFavorited: 3200
    };

    const inStoreData = {
        itemsSlidedBought: 45000,
        itemsSlidedToBuy: 18200,
        cartsCreated: 6850,
        userSavings: 84200
    };

    const geoData = {
        totalUsers: 9850,
        breakdown: [
            { code: 'ZH', name: 'Zurich', users: 4500, growth: 12.5 },
            { code: 'VD', name: 'Vaud', users: 2100, growth: 8.2 },
            { code: 'BE', name: 'Bern', users: 1800, growth: -1.5 },
            { code: 'GE', name: 'Geneva', users: 1200, growth: 22.0 },
            { code: 'TI', name: 'Ticino', users: 450, growth: 5.4 }
        ]
    };

    // Helper for Dev Tooltip
    const renderDevTooltip = (method, path, paramsObj = {}) => {
        // Merge default params with passed params
        const finalParams = { 
            time_range: cockpitTimeRange,
            ...paramsObj 
        };
        
        // Only add canton if it's not 'all'
        if (cockpitCanton !== 'all') {
            finalParams.canton = cockpitCanton;
        }

        // Format params string
        const paramsString = Object.entries(finalParams)
            .map(([k, v]) => `${k}: '${v}'`)
            .join(', ');

        return `
        <div class="hidden group-hover:block absolute z-50 bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-xl pointer-events-none">
            <div class="font-mono font-bold text-green-400">${method}</div>
            <div class="font-mono break-all">${path}</div>
            <div class="font-mono text-gray-400 mt-1">params: { ${paramsString} }</div>
            <div class="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
    `};

    // Helper for Drill-down Icon
    const drillDownIcon = `
        <div class="absolute top-4 right-4 text-gray-300 group-hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
        </div>
    `;

    return `
        <div class="p-6 space-y-6 relative">
            <!-- Header & Controls -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900">CEO Cockpit</h2>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Live Data Simulation</span>
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer" onchange="toggleCockpitDevMode()" ${cockpitDevMode ? 'checked' : ''}>
                            <div class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            <span class="ms-2 text-xs font-medium text-gray-500">Dev Mode</span>
                        </label>
                    </div>
                </div>
                
                <div class="flex items-center gap-4">
                    <!-- Canton Filter -->
                    <div class="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                        <span class="px-3 text-sm text-gray-500 font-medium">Region:</span>
                        <select onchange="setCockpitCanton(this.value)" class="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer outline-none">
                            <option value="all" ${cockpitCanton === 'all' ? 'selected' : ''}>All Switzerland</option>
                            <option value="ZH" ${cockpitCanton === 'ZH' ? 'selected' : ''}>Zurich (ZH)</option>
                            <option value="BE" ${cockpitCanton === 'BE' ? 'selected' : ''}>Bern (BE)</option>
                            <option value="VD" ${cockpitCanton === 'VD' ? 'selected' : ''}>Vaud (VD)</option>
                            <option value="GE" ${cockpitCanton === 'GE' ? 'selected' : ''}>Geneva (GE)</option>
                            <option value="TI" ${cockpitCanton === 'TI' ? 'selected' : ''}>Ticino (TI)</option>
                        </select>
                    </div>

                    <!-- Time Range Filter -->
                    <div class="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                        <span class="px-3 text-sm text-gray-500 font-medium">Time:</span>
                        <select onchange="setCockpitTimeRange(this.value)" class="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer outline-none">
                            <option value="today" ${cockpitTimeRange === 'today' ? 'selected' : ''}>Today</option>
                            <option value="7d" ${cockpitTimeRange === '7d' ? 'selected' : ''}>Last 7 Days</option>
                            <option value="30d" ${cockpitTimeRange === '30d' ? 'selected' : ''}>Last 30 Days</option>
                            <option value="ytd" ${cockpitTimeRange === 'ytd' ? 'selected' : ''}>Year-to-Date</option>
                            <option value="all" ${cockpitTimeRange === 'all' ? 'selected' : ''}>All Time</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Section 1: Growth Pulse (Top Row) -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <!-- KPI 1: Total Downloads -->
                <div onclick="openCockpitModal('growth')" class="bg-white rounded-2xl shadow-md p-6 relative overflow-visible group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
                    ${drillDownIcon}
                    <div class="relative group w-max">
                        <div class="text-gray-500 text-sm font-medium uppercase tracking-wide border-b border-dotted border-gray-400">Total Downloads</div>
                        ${renderDevTooltip('GET', '/api/v1/dashboard/growth')}
                    </div>
                    <div class="mt-2 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">${growthData.downloads.toLocaleString()}</span>
                        <span class="ml-2 text-sm font-medium text-green-600">↑ 12%</span>
                    </div>
                    <div class="mt-4">
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-gray-500">Target: 50k (Sept 2026)</span>
                            <span class="font-medium text-gray-700">25%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                            <div class="bg-blue-600 h-1.5 rounded-full" style="width: 25%"></div>
                        </div>
                    </div>
                </div>

                <!-- KPI 2: WAU -->
                <div onclick="openCockpitModal('growth')" class="bg-white rounded-2xl shadow-md p-6 relative overflow-visible group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
                    ${drillDownIcon}
                    <div class="relative group w-max">
                        <div class="text-gray-500 text-sm font-medium uppercase tracking-wide border-b border-dotted border-gray-400">Weekly Active Users</div>
                        ${renderDevTooltip('GET', '/api/v1/dashboard/growth')}
                    </div>
                    <div class="mt-2 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">${growthData.wau.toLocaleString()}</span>
                        <span class="ml-2 text-sm font-medium text-green-600">↑ 5%</span>
                    </div>
                </div>

                <!-- KPI 3: Retention -->
                <div onclick="openCockpitModal('retention')" class="bg-white rounded-2xl shadow-md p-6 relative overflow-visible group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
                    ${drillDownIcon}
                    <div class="relative group w-max">
                        <div class="text-gray-500 text-sm font-medium uppercase tracking-wide border-b border-dotted border-gray-400">Day-30 Retention</div>
                        ${renderDevTooltip('GET', '/api/v1/dashboard/retention')}
                    </div>
                    <div class="mt-2 flex items-baseline">
                        <span class="text-4xl font-extrabold text-green-600">${growthData.retention}%</span>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">vs Industry Avg 6%</div>
                </div>

                <!-- KPI 4: Live Users -->
                <div onclick="openCockpitModal('growth')" class="bg-white rounded-2xl shadow-md p-6 relative overflow-visible group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 border-l-4 border-green-500">
                    ${drillDownIcon}
                    <div class="flex justify-between items-start">
                        <div class="relative group w-max">
                            <div class="text-gray-500 text-sm font-medium uppercase tracking-wide border-b border-dotted border-gray-400">Live Users Now</div>
                            ${renderDevTooltip('GET', '/api/v1/dashboard/growth')}
                        </div>
                        <span class="flex h-3 w-3 relative">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <div class="mt-2 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">${growthData.liveUsers}</span>
                    </div>
                    <!-- Sparkline -->
                    <div class="mt-2 h-8 w-full opacity-20">
                        <svg viewBox="0 0 100 20" class="w-full h-full stroke-current text-green-600 fill-none">
                            <path d="M0 10 Q 10 15, 20 10 T 40 10 T 60 15 T 80 5 T 100 12" stroke-width="2" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Section 2: The Viral Engine -->
                <div onclick="openCockpitModal('viral')" class="bg-white rounded-2xl shadow-md p-6 relative overflow-visible group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
                    ${drillDownIcon}
                    <div class="relative group w-max mb-4">
                        <h3 class="text-lg font-bold text-gray-900 border-b border-dotted border-gray-400">The Viral Engine</h3>
                        ${renderDevTooltip('GET', '/api/v1/dashboard/virality')}
                    </div>
                    <div class="space-y-6">
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium text-gray-700">Lists Shared (Invites Sent)</span>
                                <span class="text-sm font-bold text-gray-900">${viralData.listsShared}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-blue-600 h-2.5 rounded-full" style="width: 100%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium text-gray-700">Lists Accepted (New Users)</span>
                                <span class="text-sm font-bold text-gray-900">${viralData.listsAccepted}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-green-500 h-2.5 rounded-full" style="width: ${viralData.conversionRate}%"></div>
                            </div>
                        </div>
                        <div class="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <div class="text-sm text-blue-800 font-medium">Viral Conversion Rate</div>
                                <div class="text-xs text-blue-600">Accepted / Shared</div>
                            </div>
                            <div class="text-2xl font-bold text-blue-900">${viralData.conversionRate}%</div>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Core Value & Product Mix -->
                <div onclick="openCockpitModal('engagement')" class="bg-white rounded-2xl shadow-md p-6 relative overflow-visible group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
                    ${drillDownIcon}
                    <div class="relative group w-max mb-4">
                        <h3 class="text-lg font-bold text-gray-900 border-b border-dotted border-gray-400">Core Value & Product Mix</h3>
                        ${renderDevTooltip('GET', '/api/v1/dashboard/engagement')}
                    </div>
                    <div class="flex flex-col h-full justify-between">
                        <div class="mb-4 relative">
                            <canvas id="productMixChart" height="100"></canvas>
                            <!-- Custom Legend Overlay -->
                            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div class="flex gap-8 text-xs font-bold text-white drop-shadow-md">
                                    <span>Offers: 45%</span>
                                    <span>Generic: 55%</span>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-3 mt-4">
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <div class="text-xs text-gray-500 mb-1">Generic Items Added</div>
                                <div class="text-lg font-bold text-gray-900">${engagementData.genericAdded.toLocaleString()}</div>
                            </div>
                            <div class="bg-green-50 p-3 rounded-lg">
                                <div class="text-xs text-green-700 mb-1">Offers Added</div>
                                <div class="text-lg font-bold text-green-900">${engagementData.offersAdded.toLocaleString()}</div>
                            </div>
                            <div class="bg-purple-50 p-3 rounded-lg">
                                <div class="text-xs text-purple-700 mb-1">Offers Added to Saved</div>
                                <div class="text-lg font-bold text-purple-900">${engagementData.offersFavorited.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 4: Cart Usage -->
            <div onclick="openCockpitModal('instore')" class="bg-white rounded-2xl shadow-md p-6 relative overflow-visible group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
                ${drillDownIcon}
                <div class="relative group w-max mb-4">
                    <h3 class="text-lg font-bold text-gray-900 border-b border-dotted border-gray-400">Cart Usage</h3>
                    ${renderDevTooltip('GET', '/api/v1/dashboard/instore-actions')}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-center divide-x divide-gray-100">
                    <div class="px-4">
                        <div class="text-3xl font-bold text-gray-900">${inStoreData.itemsSlidedBought.toLocaleString()}</div>
                        <div class="text-sm text-gray-500 mt-1">Items Bought (Slided)</div>
                    </div>
                    <div class="px-4">
                        <div class="text-3xl font-bold text-gray-900">${inStoreData.itemsSlidedToBuy.toLocaleString()}</div>
                        <div class="text-sm text-gray-500 mt-1">Items To Buy (Slided)</div>
                    </div>
                    <div class="px-4">
                        <div class="text-3xl font-bold text-gray-900">${inStoreData.cartsCreated.toLocaleString()}</div>
                        <div class="text-sm text-gray-500 mt-1">Total Carts Created</div>
                    </div>
                    <div class="px-4">
                        <div class="text-3xl font-bold text-green-600">CHF ${inStoreData.userSavings.toLocaleString()}</div>
                        <div class="text-sm text-gray-500 mt-1">Est. User Savings (YTD)</div>
                        <div class="relative group inline-block">
                             <div class="mt-2 text-xs text-gray-400 font-mono bg-gray-50 p-1 rounded inline-block border-b border-dotted border-gray-300">Financial Impact</div>
                             ${renderDevTooltip('GET', '/api/v1/dashboard/financial-impact')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 5: Geographic Distribution -->
            <div onclick="openCockpitModal('geo')" class="bg-white rounded-2xl shadow-md p-6 relative overflow-visible group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
                ${drillDownIcon}
                <div class="relative group w-max mb-4">
                    <h3 class="text-lg font-bold text-gray-900 border-b border-dotted border-gray-400">Geographic Distribution</h3>
                    ${renderDevTooltip('GET', '/api/v1/dashboard/geo-distribution')}
                </div>
                <div class="space-y-4">
                    ${geoData.breakdown.map(canton => `
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium text-gray-700">${canton.name} (${canton.code})</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs ${canton.growth >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">
                                        ${canton.growth >= 0 ? '↑' : '↓'} ${Math.abs(canton.growth)}%
                                    </span>
                                    <span class="text-sm font-bold text-gray-900">${canton.users.toLocaleString()}</span>
                                </div>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${(canton.users / 4500) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Modal Overlay -->
            ${cockpitModal ? renderCockpitModal() : ''}
        </div>
    `;
}

// Helper to get Drill-Down Data
function getDrillDownData() {
    // Get active campaigns for breakdown
    const activeCampaigns = (typeof campaigns !== 'undefined' && campaigns.length) 
        ? campaigns.filter(c => c.status === 'active') 
        : [{name: 'Summer Launch'}, {name: 'Influencer Push'}];

    // Simulate data for campaigns
    const campaignDownloads = activeCampaigns.map(c => ({ label: c.name, value: Math.floor(Math.random() * 25) + 10 }));
    const campaignActive = activeCampaigns.map(c => ({ label: c.name, value: Math.floor(Math.random() * 20) + 5 }));

    // Generate 90 days of trend data
    const trendData = Array.from({length: 90}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (89 - i));
        const dateStr = date.toISOString().split('T')[0];
        // Base growth curve with some noise
        const baseDownloads = 1500 + (i * 40) + (Math.sin(i * 0.1) * 100) + (Math.random() * 50);
        // WAU is roughly 40-60% of downloads, fluctuating
        const wauRatio = 0.4 + (Math.sin(i * 0.2) * 0.1) + (Math.random() * 0.05);
        const wau = Math.floor(baseDownloads * wauRatio);
        
        return {
            date: dateStr,
            totalDownloads: Math.floor(baseDownloads),
            wau: wau
        };
    });

    return {
        growth: {
            trend: trendData,
            sources: {
                downloads: [
                    { label: 'Organic + Direct', value: 35 },
                    { label: 'Referral', value: 15 },
                    ...campaignDownloads
                ],
                activeUsers: [
                    { label: 'Organic + Direct', value: 45 },
                    { label: 'Referral', value: 25 },
                    ...campaignActive
                ]
            }
        },
        retention: {
            cohorts: [
                { month: 'Jan', m0: 100, m1: 45, m2: 32, m3: 20 },
                { month: 'Feb', m0: 100, m1: 48, m2: 35, m3: 28 },
                { month: 'Mar', m0: 100, m1: 52, m2: 40, m3: null }
            ]
        },
        viral: {
            funnel: [
                { date: '06-01', sent: 45, accepted: 20 },
                { date: '06-02', sent: 50, accepted: 28 },
                { date: '06-03', sent: 65, accepted: 35 },
                { date: '06-04', sent: 80, accepted: 45 },
                { date: '06-05', sent: 95, accepted: 60 },
                { date: '06-06', sent: 120, accepted: 85 },
                { date: '06-07', sent: 110, accepted: 75 }
            ],
            referrers: [
                { id: 'u_992', invites: 150, rate: 80.5 },
                { id: 'u_845', invites: 120, rate: 75.2 },
                { id: 'u_123', invites: 95, rate: 68.0 },
                { id: 'u_567', invites: 80, rate: 62.5 },
                { id: 'u_334', invites: 65, rate: 55.0 }
            ]
        },
        engagement: {
            stores: [
                { name: 'Migros', added: 4500, favorited: 1200 },
                { name: 'Coop', added: 6200, favorited: 1500 },
                { name: 'Denner', added: 2100, favorited: 300 },
                { name: 'Aldi', added: 1800, favorited: 150 },
                { name: 'Lidl', added: 1200, favorited: 100 }
            ]
        },
        instore: {
            heatmap: [
                { day: 'Mon', times: [12, 45, 30, 65] }, // Morning, Lunch, Afternoon, Evening
                { day: 'Tue', times: [15, 48, 35, 70] },
                { day: 'Wed', times: [18, 50, 40, 75] },
                { day: 'Thu', times: [20, 55, 45, 85] },
                { day: 'Fri', times: [25, 60, 55, 95] },
                { day: 'Sat', times: [98, 85, 75, 60] },
                { day: 'Sun', times: [10, 20, 15, 30] }
            ]
        },
        geo: {
            cantons: [
                { code: 'BS', name: 'Basel-Stadt', value: 85, growth: 5.2 },
                { code: 'BL', name: 'Basel-Landschaft', value: 60, growth: 3.1 },
                { code: 'AG', name: 'Aargau', value: 70, growth: 4.5 },
                { code: 'ZH', name: 'Zurich', value: 95, growth: 12.5 },
                { code: 'SH', name: 'Schaffhausen', value: 40, growth: 1.2 },
                { code: 'TG', name: 'Thurgau', value: 50, growth: 2.8 },
                { code: 'JU', name: 'Jura', value: 30, growth: -1.5 },
                { code: 'SO', name: 'Solothurn', value: 55, growth: 3.4 },
                { code: 'BE', name: 'Bern', value: 75, growth: -1.5 },
                { code: 'LU', name: 'Lucerne', value: 65, growth: 6.7 },
                { code: 'ZG', name: 'Zug', value: 80, growth: 9.2 },
                { code: 'SZ', name: 'Schwyz', value: 50, growth: 4.1 },
                { code: 'GL', name: 'Glarus', value: 20, growth: 0.5 },
                { code: 'SG', name: 'St. Gallen', value: 60, growth: 5.5 },
                { code: 'AR', name: 'Appenzell Ausserrhoden', value: 35, growth: 1.8 },
                { code: 'AI', name: 'Appenzell Innerrhoden', value: 25, growth: 0.9 },
                { code: 'NE', name: 'Neuchâtel', value: 45, growth: 2.2 },
                { code: 'FR', name: 'Fribourg', value: 50, growth: 3.8 },
                { code: 'VD', name: 'Vaud', value: 85, growth: 8.2 },
                { code: 'OW', name: 'Obwalden', value: 30, growth: 1.1 },
                { code: 'NW', name: 'Nidwalden', value: 35, growth: 1.5 },
                { code: 'UR', name: 'Uri', value: 20, growth: 0.2 },
                { code: 'GR', name: 'Graubünden', value: 45, growth: 4.8 },
                { code: 'GE', name: 'Geneva', value: 90, growth: 22.0 },
                { code: 'VS', name: 'Valais', value: 55, growth: 6.5 },
                { code: 'TI', name: 'Ticino', value: 60, growth: 5.4 }
            ]
        }
    };
}

// Modal Rendering Logic
function renderCockpitModal() {
    let title = '';
    let content = '';
    let endpoint = '';
    const data = getDrillDownData();

    switch(cockpitModal) {
        case 'growth':
            title = 'Acquisition & Trend Analysis';
            endpoint = 'GET /api/v1/analytics/growth-trend?period=30d';
            content = `
                <div class="space-y-6">
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="text-sm font-bold text-gray-700">Active Users % (WAU / Total Downloads)</h4>
                            <div class="flex space-x-2">
                                <button onclick="updateGrowthGranularity('daily')" class="px-3 py-1 text-xs rounded-md ${growthGranularity === 'daily' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Daily</button>
                                <button onclick="updateGrowthGranularity('weekly')" class="px-3 py-1 text-xs rounded-md ${growthGranularity === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Weekly</button>
                                <button onclick="updateGrowthGranularity('monthly')" class="px-3 py-1 text-xs rounded-md ${growthGranularity === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Monthly</button>
                            </div>
                        </div>
                        <div class="h-64">
                            <canvas id="growthTrendChart"></canvas>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 class="text-sm font-bold text-gray-700 mb-4">Total Downloads Breakdown</h4>
                            <div class="h-48 flex justify-center">
                                <canvas id="downloadsSourceChart"></canvas>
                            </div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 class="text-sm font-bold text-gray-700 mb-4">Active Users Breakdown</h4>
                            <div class="h-48 flex justify-center">
                                <canvas id="activeUsersSourceChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'retention':
            title = 'Cohort Retention Heatmap';
            endpoint = 'GET /api/v1/analytics/cohorts';
            content = `
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cohort</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month 0</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month 1</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month 2</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month 3</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${data.retention.cohorts.map(c => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${c.month}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-white bg-green-600">${c.m0}%</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 bg-green-200">${c.m1}%</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 bg-green-100">${c.m2}%</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${c.m3 ? 'bg-green-50' : ''}">${c.m3 || '-'}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;
        case 'viral':
            title = 'Viral Conversion Funnel';
            endpoint = 'GET /api/v1/analytics/viral-funnel';
            content = `
                <div class="space-y-6">
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 class="text-sm font-bold text-gray-700 mb-4">Invites Sent vs Accepted</h4>
                        <div class="h-64">
                            <canvas id="viralFunnelChart"></canvas>
                        </div>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 class="text-sm font-bold text-gray-700 mb-4">Top Referrers Leaderboard</h4>
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invites</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Conv. Rate</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${data.viral.referrers.map(r => `
                                    <tr>
                                        <td class="px-4 py-2 text-sm font-mono text-gray-900">${r.id}</td>
                                        <td class="px-4 py-2 text-sm text-gray-900">${r.invites}</td>
                                        <td class="px-4 py-2 text-sm text-green-600 font-bold">${r.rate}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
        case 'engagement':
            title = 'Store Offer Performance';
            endpoint = 'GET /api/v1/analytics/store-preference';
            const categories = ['All Categories', 'Meat', 'Fruit & Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Household', 'Personal Care'];
            content = `
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-sm font-bold text-gray-700">Offers Added vs Favorited by Store</h4>
                        <select onchange="updateEngagementCategory(this.value)" class="text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                            ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="h-80">
                        <canvas id="storePreferenceChart"></canvas>
                    </div>
                </div>
            `;
            break;
        case 'instore':
            title = 'Item Interaction Heatmap (Bought/Unbought Actions)';
            endpoint = 'GET /api/v1/analytics/shopping-times';
            const timeLabels = ['Morning', 'Lunch', 'Afternoon', 'Evening'];
            content = `
                <div class="space-y-4">
                    <p class="text-sm text-gray-500">
                        Visualizing the intensity of user actions: sliding items to "Bought" and back to "To Buy".
                        <span class="inline-block w-3 h-3 bg-blue-100 ml-2 border border-gray-200"></span> Low
                        <span class="inline-block w-3 h-3 bg-blue-300 ml-1 border border-gray-200"></span> Med
                        <span class="inline-block w-3 h-3 bg-blue-500 ml-1 border border-gray-200"></span> High
                        <span class="inline-block w-3 h-3 bg-blue-700 ml-1 border border-gray-200"></span> Peak
                    </p>
                    <div class="overflow-x-auto">
                        <table class="min-w-full border-collapse">
                            <thead>
                                <tr>
                                    <th class="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Time / Day</th>
                                    ${data.instore.heatmap.map(d => `<th class="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">${d.day}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${timeLabels.map((time, timeIdx) => `
                                    <tr>
                                        <td class="p-3 text-sm font-bold text-gray-700 border-b border-gray-100">${time}</td>
                                        ${data.instore.heatmap.map(d => {
                                            const val = d.times[timeIdx];
                                            let colorClass = 'bg-blue-50 text-blue-900'; // Default/Low
                                            if (val > 80) colorClass = 'bg-blue-700 text-white font-bold'; // Peak
                                            else if (val > 60) colorClass = 'bg-blue-500 text-white'; // High
                                            else if (val > 40) colorClass = 'bg-blue-300 text-blue-900'; // Med
                                            else if (val > 20) colorClass = 'bg-blue-100 text-blue-900'; // Low-Med
                                            
                                            return `<td class="p-3 text-center text-sm ${colorClass} border border-white transition-colors hover:opacity-90 cursor-default" title="${val} Actions">${val}</td>`;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
        case 'geo':
            title = 'Swiss Canton Performance (Sorted by Penetration)';
            endpoint = 'GET /api/v1/analytics/geo-heatmap';
            
            // Sort cantons by value (Penetration) descending
            const sortedCantons = [...data.geo.cantons].sort((a, b) => b.value - a.value);
            
            const renderTile = (canton) => {
                const intensity = canton.value;
                let bgClass = 'bg-gray-100';
                let textClass = 'text-gray-500';
                
                if (intensity > 80) { bgClass = 'bg-green-600'; textClass = 'text-white'; }
                else if (intensity > 60) { bgClass = 'bg-green-500'; textClass = 'text-white'; }
                else if (intensity > 40) { bgClass = 'bg-green-400'; textClass = 'text-white'; }
                else if (intensity > 20) { bgClass = 'bg-green-200'; textClass = 'text-green-900'; }
                
                return `
                    <div class="w-24 h-24 ${bgClass} rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer hover:scale-105 transition-transform shadow-sm relative group">
                        <span class="text-lg font-bold ${textClass}">${canton.code}</span>
                        <span class="text-sm ${textClass}">${intensity}%</span>
                        
                        <!-- Tooltip -->
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-40 bg-gray-900 text-white text-xs rounded p-2 text-center shadow-lg">
                            <div class="font-bold text-sm mb-1">${canton.name}</div>
                            <div class="grid grid-cols-2 gap-x-2 text-left">
                                <span class="text-gray-400">Penetration:</span>
                                <span class="font-mono text-right">${intensity}%</span>
                                <span class="text-gray-400">Growth:</span>
                                <span class="font-mono text-right ${canton.growth >= 0 ? 'text-green-400' : 'text-red-400'}">${canton.growth}%</span>
                            </div>
                        </div>
                    </div>
                `;
            };

            content = `
                <div class="flex flex-col items-center">
                    <div class="mb-6 flex gap-4 text-sm">
                        <div class="flex items-center gap-1"><div class="w-3 h-3 bg-green-200 rounded"></div> Low</div>
                        <div class="flex items-center gap-1"><div class="w-3 h-3 bg-green-400 rounded"></div> Med</div>
                        <div class="flex items-center gap-1"><div class="w-3 h-3 bg-green-600 rounded"></div> High</div>
                    </div>
                    
                    <div class="flex flex-wrap justify-center gap-3 w-full max-w-4xl p-6 bg-gray-50 rounded-xl border border-gray-200">
                        ${sortedCantons.map(c => renderTile(c)).join('')}
                    </div>

                    <!-- Definitions Section -->
                    <div class="mt-8 w-full max-w-4xl bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h5 class="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Metric Definitions
                        </h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <span class="font-semibold text-blue-800">Penetration Rate (%)</span>
                                <p class="text-blue-700 mt-1">
                                    The percentage of the targetable population in the canton that are active users.
                                    <br>
                                    <code class="text-xs bg-blue-100 px-1 rounded mt-1 inline-block">(Active Users / Total Target Population) × 100</code>
                                </p>
                            </div>
                            <div>
                                <span class="font-semibold text-blue-800">Growth Rate (%)</span>
                                <p class="text-blue-700 mt-1">
                                    The period-over-period increase or decrease in active users.
                                    <br>
                                    <code class="text-xs bg-blue-100 px-1 rounded mt-1 inline-block">((Current Users - Previous Users) / Previous Users) × 100</code>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        default:
            title = 'Details';
            content = '<p class="p-4">No details available.</p>';
    }

    return `
        <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onclick="closeCockpitModal()"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                            <div>
                                <h3 class="text-xl leading-6 font-bold text-gray-900" id="modal-title">${title}</h3>
                                ${cockpitDevMode ? `<div class="text-xs text-gray-400 font-mono mt-1">Endpoint: ${endpoint}</div>` : ''}
                            </div>
                            <div class="flex items-center gap-2">
                                <select class="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                    <option>Last 7 Days</option>
                                    <option selected>Last 30 Days</option>
                                    <option>Year to Date</option>
                                </select>
                                <button onclick="closeCockpitModal()" class="text-gray-400 hover:text-gray-500">
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="mt-2">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Charts inside Modal
function renderCockpitModalCharts() {
    if (!cockpitModal) return;
    const data = getDrillDownData();

    if (cockpitModal === 'growth') {
        // Process data based on granularity
        let chartLabels = [];
        let chartDataDownloads = [];
        let chartDataWAU = [];
        let chartDataPct = [];
        
        const rawData = data.growth.trend; // 90 days of data
        
        if (growthGranularity === 'daily') {
            // Last 30 days
            const slice = rawData.slice(-30);
            chartLabels = slice.map(d => d.date.slice(5));
            chartDataDownloads = slice.map(d => d.totalDownloads);
            chartDataWAU = slice.map(d => d.wau);
            chartDataPct = slice.map(d => (d.wau / d.totalDownloads * 100).toFixed(1));
        } else if (growthGranularity === 'weekly') {
            // Aggregate by week (last 12 weeks)
            for (let i = 0; i < 12; i++) {
                const endIdx = rawData.length - (i * 7);
                const startIdx = Math.max(0, endIdx - 7);
                if (endIdx <= 0) break;
                
                const chunk = rawData.slice(startIdx, endIdx);
                if (chunk.length === 0) continue;
                
                const avgDownloads = chunk.reduce((sum, d) => sum + d.totalDownloads, 0) / chunk.length;
                const avgWAU = chunk.reduce((sum, d) => sum + d.wau, 0) / chunk.length;
                
                chartLabels.unshift(`Week ${12-i}`);
                chartDataDownloads.unshift(Math.round(avgDownloads));
                chartDataWAU.unshift(Math.round(avgWAU));
                chartDataPct.unshift((avgWAU / avgDownloads * 100).toFixed(1));
            }
        } else if (growthGranularity === 'monthly') {
            // Aggregate by month
            const months = {};
            rawData.forEach(d => {
                const month = d.date.slice(0, 7); // YYYY-MM
                if (!months[month]) months[month] = { downloads: [], wau: [] };
                months[month].downloads.push(d.totalDownloads);
                months[month].wau.push(d.wau);
            });
            
            Object.keys(months).sort().forEach(m => {
                const dArr = months[m].downloads;
                const wArr = months[m].wau;
                const avgD = dArr.reduce((a,b)=>a+b,0)/dArr.length;
                const avgW = wArr.reduce((a,b)=>a+b,0)/wArr.length;
                
                chartLabels.push(m);
                chartDataDownloads.push(Math.round(avgD));
                chartDataWAU.push(Math.round(avgW));
                chartDataPct.push((avgW / avgD * 100).toFixed(1));
            });
        }

        // Growth Trend Chart
        new Chart(document.getElementById('growthTrendChart'), {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: 'Active Users %',
                        data: chartDataPct,
                        backgroundColor: '#10B981', // Green
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                const pct = context.raw;
                                const absWAU = chartDataWAU[idx];
                                const absTotal = chartDataDownloads[idx];
                                return [
                                    `Active Users %: ${pct}%`,
                                    `Active Users: ${absWAU.toLocaleString()}`,
                                    `Total Downloads: ${absTotal.toLocaleString()}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Percentage (%)' }
                    }
                }
            }
        });

        // Downloads Source Pie Chart
        new Chart(document.getElementById('downloadsSourceChart'), {
            type: 'doughnut',
            data: {
                labels: data.growth.sources.downloads.map(s => s.label),
                datasets: [{
                    data: data.growth.sources.downloads.map(s => s.value),
                    backgroundColor: ['#3B82F6', '#EC4899', '#10B981', '#6B7280', '#8B5CF6', '#F59E0B']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Active Users Source Pie Chart
        new Chart(document.getElementById('activeUsersSourceChart'), {
            type: 'doughnut',
            data: {
                labels: data.growth.sources.activeUsers.map(s => s.label),
                datasets: [{
                    data: data.growth.sources.activeUsers.map(s => s.value),
                    backgroundColor: ['#3B82F6', '#EC4899', '#10B981', '#6B7280', '#8B5CF6', '#F59E0B']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    if (cockpitModal === 'viral') {
        new Chart(document.getElementById('viralFunnelChart'), {
            type: 'bar',
            data: {
                labels: data.viral.funnel.map(d => d.date),
                datasets: [
                    {
                        label: 'Invites Accepted',
                        data: data.viral.funnel.map(d => d.accepted),
                        backgroundColor: '#10B981',
                        stack: 'Stack 0',
                    },
                    {
                        label: 'Invites Sent',
                        data: data.viral.funnel.map(d => d.sent - d.accepted), // Show remaining sent
                        backgroundColor: '#3B82F6',
                        stack: 'Stack 0',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { tooltip: { mode: 'index', intersect: false } },
                scales: { x: { stacked: true }, y: { stacked: true } }
            }
        });
    }

    if (cockpitModal === 'engagement') {
        const ctx = document.getElementById('storePreferenceChart');
        if (window.charts && window.charts.storePreference) {
            window.charts.storePreference.destroy();
        }
        window.charts = window.charts || {};
        
        window.charts.storePreference = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.engagement.stores.map(s => s.name),
                datasets: [
                    {
                        label: 'Offers Added',
                        data: data.engagement.stores.map(s => s.added),
                        backgroundColor: '#10B981',
                    },
                    {
                        label: 'Offers Favorited',
                        data: data.engagement.stores.map(s => s.favorited),
                        backgroundColor: '#8B5CF6',
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { stacked: false }, y: { stacked: false } }
            }
        });
    }
}

// Cockpit Helper Functions
window.toggleCockpitDevMode = function() {
    cockpitDevMode = !cockpitDevMode;
    renderApp();
};

window.setCockpitTimeRange = function(range) {
    cockpitTimeRange = range;
    renderApp();
};

window.setCockpitCanton = function(canton) {
    cockpitCanton = canton;
    renderApp();
};

window.openCockpitModal = function(type) {
    cockpitModal = type;
    renderApp();
};

window.closeCockpitModal = function() {
    cockpitModal = null;
    renderApp();
};

window.updateEngagementCategory = function(category) {
    if (!window.charts || !window.charts.storePreference) return;

    const chart = window.charts.storePreference;
    const data = getDrillDownData().engagement.stores;
    
    // Simulate filtering by modifying the data based on category
    // In a real app, this would fetch data from the endpoint
    const factor = category === 'All Categories' ? 1 : Math.random() * 0.5 + 0.1;
    
    const newData = data.map(s => ({
        name: s.name,
        added: Math.round(s.added * factor * (0.8 + Math.random() * 0.4)),
        favorited: Math.round(s.favorited * factor * (0.8 + Math.random() * 0.4))
    }));

    chart.data.datasets[0].data = newData.map(s => s.added);
    chart.data.datasets[1].data = newData.map(s => s.favorited);
    chart.update();
};

window.updateGrowthGranularity = function(granularity) {
    growthGranularity = granularity;
    renderApp();
};

function renderCEOCockpitCharts() {
    const ctx = document.getElementById('productMixChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (typeof charts !== 'undefined' && charts.productMix) {
        charts.productMix.destroy();
    } else {
        window.charts = window.charts || {};
    }

    window.charts.productMix = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Product Mix'],
            datasets: [
                {
                    label: 'Offers Added',
                    data: [45],
                    backgroundColor: '#10B981', // Green-500
                    barThickness: 50
                },
                {
                    label: 'Generic Items Added',
                    data: [55],
                    backgroundColor: '#9CA3AF', // Gray-400
                    barThickness: 50
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    stacked: true,
                    display: false,
                    max: 100
                },
                y: {
                    stacked: true,
                    display: false
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
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

function renderArchive() {
    const inactiveCampaigns = campaigns.filter(c => c.status === 'inactive');
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const inactiveCount = inactiveCampaigns.length;

    return `
        <div class="p-6">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Campaign Archive</h2>
            
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Total Campaigns</div>
                    <div class="text-3xl font-bold text-gray-900">${totalCampaigns}</div>
                    <div class="text-xs text-gray-400 mt-1">Active + Inactive</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Active Campaigns</div>
                    <div class="text-3xl font-bold text-green-600">${activeCampaigns}</div>
                    <div class="text-xs text-gray-400 mt-1">Currently running</div>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-6">
                    <div class="text-gray-500 text-sm mb-2">Inactive/Deleted</div>
                    <div class="text-3xl font-bold text-red-600">${inactiveCount}</div>
                    <div class="text-xs text-gray-400 mt-1">Archived campaigns</div>
                </div>
            </div>

            <!-- Inactive Campaigns Table -->
            <div class="bg-white rounded-2xl shadow-md overflow-hidden">
                <div class="p-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">Inactive & Deleted Campaigns</h3>
                </div>
                ${inactiveCampaigns.length === 0 ? `
                    <div class="p-12 text-center">
                        <div class="text-6xl mb-4">🗄️</div>
                        <p class="text-gray-500 text-lg">No archived campaigns</p>
                        <p class="text-gray-400 text-sm mt-2">Deleted or inactive campaigns will appear here</p>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Campaign Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Geo</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Language</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Original Dates</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${inactiveCampaigns.map(campaign => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4">
                                            <div class="font-medium text-gray-900">${campaign.name}</div>
                                            <div class="text-sm text-gray-500">${campaign.concept}</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <code class="text-xs bg-gray-100 px-2 py-1 rounded">${campaign.campaign_id}</code>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-700">${campaign.geo}</td>
                                        <td class="px-6 py-4 text-sm text-gray-700">${campaign.language}</td>
                                        <td class="px-6 py-4 text-sm text-gray-700">
                                            ${campaign.date_start ? new Date(campaign.date_start).toLocaleDateString() : 'N/A'}
                                            ${campaign.date_end ? ' - ' + new Date(campaign.date_end).toLocaleDateString() : ''}
                                        </td>
                                        <td class="px-6 py-4">
                                            <button onclick="showReactivateModal('${campaign.campaign_id}')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium">
                                                ♻️ Reactivate
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

        <!-- Reactivation Modal -->
        ${reactivatingCampaign ? renderReactivateModal() : ''}
    `;
}

function renderReactivateModal() {
    const campaign = campaigns.find(c => c.campaign_id === reactivatingCampaign);
    if (!campaign) return '';

    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="if(event.target === this) closeReactivateModal()">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Reactivate Campaign</h3>
                <p class="text-gray-600 mb-6">Set new dates to reactivate: <strong>${campaign.name}</strong></p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input type="date" id="reactivate-start-date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rappn-green" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                        <input type="date" id="reactivate-end-date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rappn-green">
                    </div>
                </div>

                <div class="flex gap-3 mt-6">
                    <button onclick="closeReactivateModal()" class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                        Cancel
                    </button>
                    <button onclick="confirmReactivate()" class="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                        Reactivate Campaign
                    </button>
                </div>
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
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-bold">Clicks Over Time</h3>
                                <div class="flex gap-2">
                                    <button onclick="setClicksTimeframe('daily')" class="px-3 py-1 text-sm rounded ${clicksTimeframe === 'daily' ? 'bg-rappn-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                        Daily
                                    </button>
                                    <button onclick="setClicksTimeframe('weekly')" class="px-3 py-1 text-sm rounded ${clicksTimeframe === 'weekly' ? 'bg-rappn-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                        Weekly
                                    </button>
                                    <button onclick="setClicksTimeframe('monthly')" class="px-3 py-1 text-sm rounded ${clicksTimeframe === 'monthly' ? 'bg-rappn-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                        Monthly
                                    </button>
                                </div>
                            </div>
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

                    <!-- Charts Row 3 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <!-- Organic vs Paid -->
                        <div class="bg-white rounded-2xl shadow-md p-6">
                            <h3 class="text-xl font-bold mb-4">Organic vs Paid</h3>
                            <div style="height: 300px; position: relative;">
                                <canvas id="organicVsPaidChart"></canvas>
                            </div>
                        </div>

                        <!-- Clicks by Country -->
                        <div class="bg-white rounded-2xl shadow-md p-6">
                            <h3 class="text-xl font-bold mb-4">Clicks by Country</h3>
                            <div style="height: 300px; position: relative;">
                                <canvas id="clicksByCountryChart"></canvas>
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
        const response = await fetch(`${API_BASE}/analytics/overview?status=${campaignFilter}&timeframe=${clicksTimeframe}`);
        if (!response.ok) throw new Error('Failed to load overview analytics');
        overviewAnalytics = await response.json();
        console.log('Overview analytics loaded:', overviewAnalytics);
    } catch (error) {
        console.error('Error loading overview analytics:', error);
        alert('Failed to load performance data');
    }
}

// Set clicks timeframe and reload data
window.setClicksTimeframe = async function(timeframe) {
    clicksTimeframe = timeframe;
    renderApp();
    // Reload analytics with new timeframe
    if (!selectedCampaign) {
        await loadOverviewAnalytics();
        renderApp();
    } else {
        await loadCampaignAnalytics(selectedCampaign.campaign_id);
        renderApp();
    }
};

// Load campaign-specific analytics
async function loadCampaignAnalytics(campaign_id) {
    try {
        const response = await fetch(`${API_BASE}/analytics/campaign/${campaign_id}?timeframe=${clicksTimeframe}`);
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

    // Organic vs Paid
    const organicVsPaidCanvas = document.getElementById('organicVsPaidChart');
    if (organicVsPaidCanvas && overviewAnalytics.clicks_by_type) {
        const data = overviewAnalytics.clicks_by_type;
        charts.organicVsPaid = new Chart(organicVsPaidCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Organic', 'Paid'],
                datasets: [{
                    data: [data.organic, data.paid],
                    backgroundColor: ['#3aaa35', '#18a19a'],
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
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Clicks by Country
    const clicksByCountryCanvas = document.getElementById('clicksByCountryChart');
    if (clicksByCountryCanvas && overviewAnalytics.clicks_by_country) {
        const countries = overviewAnalytics.clicks_by_country.map(c => c.country);
        const clicks = overviewAnalytics.clicks_by_country.map(c => c.clicks);
        
        charts.clicksByCountry = new Chart(clicksByCountryCanvas, {
            type: 'bar',
            data: {
                labels: countries,
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
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    x: { 
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
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

// Show reactivation modal
window.showReactivateModal = function(campaignId) {
    reactivatingCampaign = campaignId;
    renderApp();
};

// Close reactivation modal
window.closeReactivateModal = function() {
    reactivatingCampaign = null;
    renderApp();
};

// Confirm campaign reactivation
window.confirmReactivate = async function() {
    const startDate = document.getElementById('reactivate-start-date').value;
    const endDate = document.getElementById('reactivate-end-date').value;
    
    if (!startDate) {
        alert('Please select a start date');
        return;
    }
    
    const campaign = campaigns.find(c => c.campaign_id === reactivatingCampaign);
    if (!campaign) return;
    
    try {
        // Update campaign with new dates and set to active
        const response = await fetch(`${API_BASE}/campaigns/${reactivatingCampaign}/reactivate`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date_start: startDate,
                date_end: endDate || null
            })
        });
        
        if (response.ok) {
            alert(`Campaign "${campaign.name}" reactivated successfully!`);
            reactivatingCampaign = null;
            await loadCampaigns();
            renderApp();
        } else {
            alert('Failed to reactivate campaign');
        }
    } catch (error) {
        console.error('Error reactivating campaign:', error);
        alert('Failed to reactivate campaign');
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
    
    const logoImg = new Image();
    logoImg.onload = function() {
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
        
        // Rappn logo
        const logoHeight = 60;
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
        const logoX = (size - logoWidth) / 2;
        ctx.drawImage(logoImg, logoX, 10, logoWidth, logoHeight);
        
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
    logoImg.src = '/logo.svg';
};
