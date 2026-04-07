/* ============================================
   NUDGE — App Logic & Interactions
   ============================================ */

// ---- Supabase Configuration ----
const SUPABASE_URL = 'https://gsieggibnmmafdbuwyms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaWVnZ2libm1tYWZkYnV3eW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NzI1MzYsImV4cCI6MjA5MTE0ODUzNn0.Z6OYMsBnkA861PAIyIR_iWQyE-SSAKbWdZ1E88RcxoA';

// Initialize Supabase client (with fallback if CDN hasn't loaded)
let supabase = null;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase connected');
    }
} catch (e) {
    console.warn('Supabase not available, using localStorage fallback');
}

// ---- Data Persistence & Auth State ----
let currentUser = null;

async function saveTransactionToCloud(txParams) {
    if (!supabase || !currentUser) return null;
    
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{ ...txParams, user_id: currentUser.id }])
            .select();
            
        if (error) throw error;
        return data[0];
    } catch (e) {
        console.error('Save error:', e);
        showToast('Error saving to cloud', 'error');
        return null;
    }
}

async function fetchTransactionsFromCloud() {
    if (!supabase || !currentUser) return [];
    
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Fetch error:', e);
        return [];
    }
}

function loadTransactionsLocal() {
    try {
        const saved = localStorage.getItem('nudge_transactions');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
}

// ---- SVG Icon Map (Comprehensive) ----
const CATEGORY_ICONS = {
    food:           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
    groceries:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    transport:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg>',
    shopping:       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    subscriptions:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    rent:           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    mortgage:       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M7 15h2"/><path d="M15 15h2"/></svg>',
    insurance:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    utilities:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    entertainment:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    health:         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    education:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    travel:         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    taxes:          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    investments:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    savings:        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.1C1.3 9.5 1 10 1 10.8V14h2"/><circle cx="12.5" cy="11.5" r=".5"/></svg>',
    childcare:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v6"/><path d="M8 18l4-6 4 6"/><path d="M6 18h12"/><path d="M8 22h8"/></svg>',
    pets:           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    personalcare:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    gifts:          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
    charity:        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    fitness:        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    phone:          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    internet:       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
    gas:            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><line x1="6" y1="10" x2="14" y2="10"/><path d="M16 6h1a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h0a1 1 0 0 0 1-1V6"/></svg>',
    parking:        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>',
    income:         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    other:          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
};

// ---- Category Color Classes ----
const CATEGORY_COLORS = {
    food: 'food', groceries: 'food', transport: 'transport', gas: 'transport', parking: 'transport',
    shopping: 'shopping', subscriptions: 'subs', rent: 'rent', mortgage: 'rent',
    insurance: 'subs', utilities: 'transport', entertainment: 'entertainment',
    health: 'health', fitness: 'health', education: 'subs', travel: 'transport',
    taxes: 'shopping', investments: 'income', savings: 'income',
    childcare: 'entertainment', pets: 'entertainment', personalcare: 'shopping',
    gifts: 'entertainment', charity: 'entertainment', phone: 'subs', internet: 'subs',
    income: 'income', other: 'other',
};

function getCategoryClass(category) {
    return CATEGORY_COLORS[category] || 'other';
}

// ---- Smart Icon Suggestion Engine ----
const ICON_KEYWORDS = {
    food:           ['food', 'restaurant', 'dining', 'lunch', 'dinner', 'breakfast', 'meal', 'cafe', 'coffee', 'pizza', 'burger', 'takeout', 'delivery'],
    groceries:      ['grocery', 'groceries', 'supermarket', 'market', 'produce', 'walmart', 'costco', 'whole foods', 'trader joe'],
    transport:      ['transport', 'transportation', 'uber', 'lyft', 'taxi', 'cab', 'bus', 'train', 'metro', 'subway', 'car', 'ride', 'commute'],
    gas:            ['gas', 'fuel', 'gasoline', 'petrol', 'station', 'shell', 'chevron', 'bp', 'exxon'],
    parking:        ['parking', 'garage', 'meter', 'valet'],
    shopping:       ['shopping', 'clothes', 'clothing', 'shoes', 'apparel', 'amazon', 'target', 'walmart', 'ebay', 'fashion', 'accessories'],
    subscriptions:  ['subscription', 'subscriptions', 'subs', 'netflix', 'spotify', 'hulu', 'disney', 'apple', 'google', 'streaming', 'membership', 'annual', 'monthly plan'],
    rent:           ['rent', 'lease', 'apartment', 'housing'],
    mortgage:       ['mortgage', 'home loan', 'house payment', 'property payment', 'home equity'],
    insurance:      ['insurance', 'premium', 'coverage', 'policy', 'auto insurance', 'health insurance', 'life insurance', 'home insurance', 'renters insurance', 'dental', 'vision'],
    utilities:      ['utility', 'utilities', 'electric', 'electricity', 'water', 'gas bill', 'sewage', 'trash', 'garbage', 'power', 'energy'],
    entertainment:  ['entertainment', 'fun', 'movie', 'concert', 'game', 'gaming', 'event', 'theater', 'show', 'party', 'bar', 'nightlife', 'hobby'],
    health:         ['health', 'medical', 'doctor', 'hospital', 'clinic', 'pharmacy', 'medicine', 'prescription', 'therapy', 'dentist', 'dental', 'vision', 'eye', 'mental health'],
    fitness:        ['fitness', 'gym', 'workout', 'yoga', 'pilates', 'personal trainer', 'exercise', 'sports', 'athletic'],
    education:      ['education', 'school', 'tuition', 'college', 'university', 'course', 'class', 'book', 'textbook', 'training', 'learning', 'student loan'],
    travel:         ['travel', 'flight', 'airline', 'hotel', 'airbnb', 'vacation', 'trip', 'booking', 'luggage', 'passport', 'resort'],
    taxes:          ['tax', 'taxes', 'irs', 'federal', 'state tax', 'property tax', 'sales tax', 'tax return', 'cpa', 'accountant'],
    investments:    ['investment', 'investing', 'stock', 'stocks', 'crypto', 'bitcoin', 'etf', 'mutual fund', 'brokerage', 'robinhood', 'fidelity', '401k', 'ira', 'retirement'],
    savings:        ['savings', 'saving', 'emergency fund', 'piggy bank', 'deposit'],
    childcare:      ['childcare', 'daycare', 'babysitter', 'nanny', 'child', 'kids', 'baby', 'school supplies', 'diapers', 'formula'],
    pets:           ['pet', 'pets', 'dog', 'cat', 'vet', 'veterinary', 'pet food', 'grooming', 'animal'],
    personalcare:   ['personal care', 'haircut', 'salon', 'spa', 'skincare', 'beauty', 'cosmetics', 'makeup', 'grooming', 'barber', 'nails', 'massage'],
    gifts:          ['gift', 'gifts', 'present', 'birthday', 'wedding', 'anniversary', 'holiday', 'christmas'],
    charity:        ['charity', 'donation', 'donate', 'nonprofit', 'tithe', 'church', 'volunteering', 'giving'],
    phone:          ['phone', 'cellphone', 'mobile', 'cell plan', 'verizon', 'at&t', 't-mobile', 'sprint', 'data plan'],
    internet:       ['internet', 'wifi', 'broadband', 'cable', 'fiber', 'comcast', 'spectrum', 'xfinity'],
    income:         ['income', 'salary', 'wage', 'paycheck', 'freelance', 'bonus', 'commission', 'dividend', 'refund', 'reimbursement', 'payment received', 'deposit'],
};

// All built-in categories with display labels
const ALL_CATEGORIES = [
    { id: 'food', label: 'Food & Dining' },
    { id: 'groceries', label: 'Groceries' },
    { id: 'transport', label: 'Transport' },
    { id: 'gas', label: 'Gas & Fuel' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'rent', label: 'Rent' },
    { id: 'mortgage', label: 'Mortgage' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'utilities', label: 'Utilities' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'health', label: 'Healthcare' },
    { id: 'fitness', label: 'Fitness & Gym' },
    { id: 'education', label: 'Education' },
    { id: 'travel', label: 'Travel' },
    { id: 'taxes', label: 'Taxes' },
    { id: 'investments', label: 'Investments' },
    { id: 'savings', label: 'Savings' },
    { id: 'childcare', label: 'Childcare' },
    { id: 'pets', label: 'Pets' },
    { id: 'personalcare', label: 'Personal Care' },
    { id: 'gifts', label: 'Gifts' },
    { id: 'charity', label: 'Charity' },
    { id: 'phone', label: 'Phone Plan' },
    { id: 'internet', label: 'Internet' },
    { id: 'parking', label: 'Parking' },
    { id: 'income', label: 'Income' },
    { id: 'other', label: 'Other' },
];

// User-created custom categories
const customCategories = [];

function suggestCategory(input) {
    if (!input || input.length < 2) return [];
    const q = input.toLowerCase();
    const results = [];
    
    // First: match built-in categories by keyword
    for (const [catId, keywords] of Object.entries(ICON_KEYWORDS)) {
        const score = keywords.reduce((acc, kw) => {
            if (kw.includes(q) || q.includes(kw)) return acc + (kw === q ? 10 : 5);
            return acc;
        }, 0);
        if (score > 0) {
            const cat = ALL_CATEGORIES.find(c => c.id === catId);
            if (cat) results.push({ ...cat, score });
        }
    }
    
    // Also match by category label
    ALL_CATEGORIES.forEach(cat => {
        if (cat.label.toLowerCase().includes(q) || cat.id.includes(q)) {
            const existing = results.find(r => r.id === cat.id);
            if (existing) existing.score += 8;
            else results.push({ ...cat, score: 8 });
        }
    });
    
    // Check custom categories
    customCategories.forEach(cat => {
        if (cat.label.toLowerCase().includes(q) || cat.id.includes(q)) {
            results.push({ ...cat, score: 7 });
        }
    });
    
    // Sort by score (best matches first)
    results.sort((a, b) => b.score - a.score);
    
    // Always add "Create custom" option at the end
    if (results.length === 0 || !results.find(r => r.id === q.replace(/\s+/g, ''))) {
        results.push({ id: '__create__', label: `Create "${input}"`, isCreate: true, originalInput: input });
    }
    
    return results.slice(0, 6);
}

function createCustomCategory(name) {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (ALL_CATEGORIES.find(c => c.id === id) || customCategories.find(c => c.id === id)) {
        return id; // Already exists
    }
    // Add the custom category with generic icon
    CATEGORY_ICONS[id] = CATEGORY_ICONS.other;
    CATEGORY_COLORS[id] = 'other';
    customCategories.push({ id, label: name });
    return id;
}

// ---- Data ----
const TRANSACTIONS = [
    { id: 1, name: 'Starbucks Coffee', category: 'food', amount: -5.75, payMethod: 'credit', time: '8:32 AM', date: 'Today' },
    { id: 2, name: 'Uber Ride', category: 'transport', amount: -18.40, payMethod: 'debit', time: '10:15 AM', date: 'Today' },
    { id: 3, name: 'Amazon Purchase', category: 'shopping', amount: -67.99, payMethod: 'credit', time: '2:45 PM', date: 'Today' },
    { id: 4, name: 'Salary Deposit', category: 'income', amount: 3200.00, payMethod: 'bank', time: '9:00 AM', date: 'Today' },
    { id: 5, name: 'State Farm Insurance', category: 'insurance', amount: -145.00, payMethod: 'bank', time: '6:00 AM', date: 'Today' },
    { id: 6, name: 'Spotify Premium', category: 'subscriptions', amount: -9.99, payMethod: 'credit', time: '12:00 AM', date: 'Yesterday' },
    { id: 7, name: 'Whole Foods', category: 'groceries', amount: -45.32, payMethod: 'debit', time: '6:30 PM', date: 'Yesterday' },
    { id: 8, name: 'Shell Gas Station', category: 'gas', amount: -42.00, payMethod: 'credit', time: '4:20 PM', date: 'Yesterday' },
    { id: 9, name: 'Con Edison Electric', category: 'utilities', amount: -128.50, payMethod: 'bank', time: '8:00 AM', date: 'Yesterday' },
    { id: 10, name: 'Netflix', category: 'subscriptions', amount: -15.99, payMethod: 'credit', time: '12:00 AM', date: 'Apr 4' },
    { id: 11, name: 'Nike Store', category: 'shopping', amount: -129.00, payMethod: 'credit', time: '3:15 PM', date: 'Apr 4' },
    { id: 12, name: 'Street Food Vendor', category: 'food', amount: -8.50, payMethod: 'cash', time: '1:30 PM', date: 'Apr 4' },
    { id: 13, name: 'Chipotle', category: 'food', amount: -12.45, payMethod: 'debit', time: '1:00 PM', date: 'Apr 3' },
    { id: 14, name: 'Freelance Payment', category: 'income', amount: 750.00, payMethod: 'bank', time: '11:00 AM', date: 'Apr 3' },
    { id: 15, name: 'CloudTech Services', category: 'subscriptions', amount: -189.00, payMethod: 'credit', time: '8:00 AM', date: 'Apr 3' },
    { id: 16, name: 'Target', category: 'shopping', amount: -34.50, payMethod: 'debit', time: '5:45 PM', date: 'Apr 2' },
    { id: 17, name: 'Mortgage Payment', category: 'mortgage', amount: -1850.00, payMethod: 'bank', time: '12:00 AM', date: 'Apr 1' },
    { id: 18, name: 'Gym Membership', category: 'fitness', amount: -49.99, payMethod: 'credit', time: '12:00 AM', date: 'Apr 1' },
    { id: 19, name: 'T-Mobile Phone Plan', category: 'phone', amount: -65.00, payMethod: 'bank', time: '12:00 AM', date: 'Apr 1' },
    { id: 20, name: 'Parking Meter', category: 'parking', amount: -3.00, payMethod: 'cash', time: '2:00 PM', date: 'Apr 1' },
];

const RECURRING_PAYMENTS = [
    { name: 'Netflix', category: 'subscriptions', amount: 15.99, frequency: 'Monthly', nextDate: 'Apr 9', upcoming: true },
    { name: 'Spotify', category: 'subscriptions', amount: 9.99, frequency: 'Monthly', nextDate: 'Apr 12', upcoming: true },
    { name: 'Gym Membership', category: 'fitness', amount: 49.99, frequency: 'Monthly', nextDate: 'Apr 15', upcoming: false },
    { name: 'iCloud Storage', category: 'subscriptions', amount: 2.99, frequency: 'Monthly', nextDate: 'Apr 18', upcoming: false },
    { name: 'Mortgage', category: 'mortgage', amount: 1850.00, frequency: 'Monthly', nextDate: 'May 1', upcoming: false },
    { name: 'Auto Insurance', category: 'insurance', amount: 145.00, frequency: 'Monthly', nextDate: 'May 1', upcoming: false },
    { name: 'Home Insurance', category: 'insurance', amount: 95.00, frequency: 'Monthly', nextDate: 'May 5', upcoming: false },
    { name: 'Car Insurance', category: 'insurance', amount: 340.00, frequency: 'Quarterly', nextDate: 'Jul 1', upcoming: false },
    { name: 'Hulu', category: 'subscriptions', amount: 12.99, frequency: 'Monthly', nextDate: 'Apr 22', upcoming: false },
    { name: 'Phone Plan', category: 'phone', amount: 65.00, frequency: 'Monthly', nextDate: 'May 1', upcoming: false },
    { name: 'Internet', category: 'internet', amount: 79.99, frequency: 'Monthly', nextDate: 'Apr 20', upcoming: false },
    { name: 'Electric Bill', category: 'utilities', amount: 128.50, frequency: 'Monthly', nextDate: 'May 3', upcoming: false },
];




const CHART_DATA = {
    week: { values: [45, 120, 68, 210, 95, 180, 42], labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], total: '$760.00' },
    month: { values: [320, 450, 280, 580, 190, 640, 380, 520, 290, 410, 350, 480, 150, 600, 270, 390, 510, 180, 430, 300, 550, 240, 470, 360, 290, 500, 210, 440, 370, 250], labels: ['1','5','10','15','20','25','30'], total: '$1,247.80' },
    year: { values: [2100, 1800, 2400, 1950, 2300, 2700, 1600, 2100, 2500, 1900, 2200, 2000], labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], total: '$25,500' },
};

// ---- State ----
let currentScreen = 'home';
let selectedCategory = 'food';
let currentTxType = 'expense';
let currentPeriod = 'week';
let isRecurringToggled = false;

// ---- DOM References ----
const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item[data-screen]');
const navAdd = document.getElementById('nav-add');
const modalOverlay = document.getElementById('modal-overlay');
const periodBtns = document.querySelectorAll('.period-btn');
const periodIndicator = document.querySelector('.period-indicator');
const filterPills = document.querySelectorAll('.filter-pill');
const toggleEl = document.getElementById('tx-recurring');
const scanBtn = document.getElementById('btn-capture-receipt');
const scanLine = document.getElementById('scan-line');
const scanResult = document.getElementById('scan-result');
const scannerPreview = document.getElementById('scanner-preview');

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('ServiceWorker registered with scope:', registration.scope))
                .catch(error => console.log('ServiceWorker registration failed:', error));
        });
    }
    if (!window.supabase) {
        console.warn("Supabase not loaded yet.");
    }
    
    setupAuthUI();
    
    if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSessionStatus(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            handleSessionStatus(session);
        });
    }

    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
    });
    updateStatusTime();
    setInterval(updateStatusTime, 60000);
    updateGreeting();
    renderTransactions();
    renderFullTransactions();
    renderRecurringPayments();
    drawSpendingChart();
    drawForecastChart();
    setupNavigation();
    setupModal();
    setupPeriodToggle();
    setupFilterPills();
    setupSmartCategoryInput();
    setupPaymentMethodSelect();
    setupRecurringToggle();
    setupScanner();
    setupFormSubmit();
    setupVoiceInput();
});

// ---- Auth Controller ----
function setupAuthUI() {
    const tabs = document.querySelectorAll('.auth-tab');
    const nameGroup = document.getElementById('name-group');
    const authForm = document.getElementById('auth-form');
    const submitBtn = document.getElementById('btn-auth-submit');
    const errorMsg = document.getElementById('auth-error-message');
    
    let isSignUp = false;

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            isSignUp = e.target.dataset.tab === 'signup';
            
            nameGroup.style.display = isSignUp ? 'block' : 'none';
            submitBtn.textContent = isSignUp ? 'Create Account' : 'Log In';
            errorMsg.classList.add('hidden');
        });
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!supabase) return showToast('Database connection failed', 'error');
        
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const fullName = document.getElementById('auth-name').value;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Please wait...';
        errorMsg.classList.add('hidden');

        try {
            let error;
            if (isSignUp) {
                const res = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });
                error = res.error;
            } else {
                const res = await supabase.auth.signInWithPassword({ email, password });
                error = res.error;
            }

            if (error) throw error;

            if (isSignUp) {
                authForm.reset();
                showToast('Account created! Logging in...', 'success');
            }

        } catch (err) {
            errorMsg.textContent = err.message || 'Authentication failed';
            errorMsg.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = isSignUp ? 'Create Account' : 'Log In';
        }
    });
}

function handleSessionStatus(session) {
    const authScreen = document.getElementById('auth-screen');
    const mainAppWrapper = document.getElementById('main-app-wrapper');

    if (session && session.user) {
        // Logged In
        currentUser = session.user;
        authScreen.classList.add('hidden');
        mainAppWrapper.classList.remove('hidden');
        
        // Fetch User Data from Cloud
        initUserData();
    } else {
        // Logged Out
        currentUser = null;
        authScreen.classList.remove('hidden');
        mainAppWrapper.classList.add('hidden');
        TRANSACTIONS.length = 0; // Clear memory
    }
}

async function initUserData() {
    // 1. Fetch cloud transactions
    const dbTx = await fetchTransactionsFromCloud();
    if (dbTx && dbTx.length > 0) {
        TRANSACTIONS.length = 0;
        dbTx.forEach(tx => TRANSACTIONS.push(tx));
    }
    
    // 2. Set Custom Greeting from Profile if available
    if (currentUser?.user_metadata?.full_name) {
        const firstName = currentUser.user_metadata.full_name.split(' ')[0];
        document.getElementById('greeting-sub').textContent = `Let's track your finances, ${firstName}.`;
    }
    
    // 3. Render everything
    animateBalanceOnLoad();
    renderTransactions();
    renderFullTransactions();
}

// ---- Status Bar Time ----
function updateStatusTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    document.getElementById('status-time').textContent = `${hours}:${minutes}`;
}

// ---- Greeting ----
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    document.getElementById('greeting-sub').textContent = greeting;
}

// ---- Navigation ----
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.dataset.screen;
            navigateTo(screen);
        });
    });

    navAdd.addEventListener('click', () => {
        openModal();
    });

    // Quick action buttons
    document.getElementById('btn-expense')?.addEventListener('click', () => openModal('expense'));
    document.getElementById('btn-income')?.addEventListener('click', () => openModal('income'));
    document.getElementById('btn-scan-receipt')?.addEventListener('click', () => {
        navigateTo('scan');
    });
    document.getElementById('btn-see-all-tx')?.addEventListener('click', () => navigateTo('transactions'));
    document.getElementById('btn-see-all-insights')?.addEventListener('click', () => navigateTo('insights'));
}

function navigateTo(screenId) {
    if (screenId === currentScreen) return;

    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');
    
    navItems.forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    currentScreen = screenId;

    // Scroll to top on new screen
    const scroll = document.querySelector(`#screen-${screenId} .screen-scroll`);
    if (scroll) scroll.scrollTop = 0;
}

// ---- Modal ----
function setupModal() {
    document.getElementById('btn-cancel-tx')?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Handle segmented control toggle
    const segmentBtns = document.querySelectorAll('.segment-btn');
    segmentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            
            // Only toggle if not already active
            if (!e.target.classList.contains('active')) {
                // Remove active class from all
                segmentBtns.forEach(b => b.classList.remove('active'));
                
                // Add to clicked
                e.target.classList.add('active');
                
                // Call openModal with new type to update form state
                openModal(type);
            }
        });
    });
}
function openModal(type = 'expense') {
    currentTxType = typeof type === 'string' ? type : 'expense';
    
    // Update modal title logic
    const modalTitleEl = document.querySelector('#screen-home .modal-title');
    if (modalTitleEl) {
        modalTitleEl.textContent = currentTxType === 'income' ? 'Add Income' : 'Add Transaction';
    }

    // Update input prefix visually
    const prefixEl = document.querySelector('.amount-prefix');
    if (prefixEl) {
        prefixEl.textContent = currentTxType === 'income' ? '+$' : '-$';
        prefixEl.style.color = currentTxType === 'income' ? 'var(--accent-emerald-light)' : 'var(--text-secondary)';
    }

    // Update segmented control buttons
    const segmentBtns = document.querySelectorAll('.segment-btn');
    segmentBtns.forEach(btn => {
        if (btn.dataset.type === currentTxType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    modalOverlay?.classList.remove('hidden');
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tx-date').value = today;
}

function closeModal() {
    modalOverlay?.classList.add('hidden');
    document.getElementById('add-tx-form')?.reset();
}

// ---- Period Toggle ----
function setupPeriodToggle() {
    periodBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            periodIndicator.style.transform = `translateX(${index * 100}%)`;
            currentPeriod = btn.dataset.period;
            drawSpendingChart();
            updateChartTotal();
        });
    });
}

function updateChartTotal() {
    document.getElementById('chart-total').textContent = CHART_DATA[currentPeriod].total;
}

// ---- Filter Pills ----
function setupFilterPills() {
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const filter = pill.dataset.filter;
            renderFullTransactions(filter);
        });
    });
}

// ---- Smart Category Input ----
let selectedPayMethod = 'credit';

function setupSmartCategoryInput() {
    const input = document.getElementById('category-input');
    const suggestions = document.getElementById('category-suggestions');
    const selectedDisplay = document.getElementById('selected-category-display');
    const clearBtn = document.getElementById('clear-category');
    if (!input || !suggestions) return;
    
    input.addEventListener('input', () => {
        const val = input.value.trim();
        const results = suggestCategory(val);
        
        if (val.length < 2) {
            suggestions.classList.add('hidden');
            return;
        }
        
        suggestions.innerHTML = results.map(cat => {
            const icon = CATEGORY_ICONS[cat.id] || CATEGORY_ICONS.other;
            const catClass = getCategoryClass(cat.id);
            if (cat.isCreate) {
                return `<button type="button" class="cat-suggestion create" data-id="__create__" data-name="${cat.originalInput}">
                    <div class="cat-sug-icon category-icon-wrap other">${CATEGORY_ICONS.other}</div>
                    <span>+ ${cat.label}</span>
                </button>`;
            }
            return `<button type="button" class="cat-suggestion" data-id="${cat.id}">
                <div class="cat-sug-icon category-icon-wrap ${catClass}">${icon}</div>
                <span>${cat.label}</span>
            </button>`;
        }).join('');
        suggestions.classList.remove('hidden');
        
        // Attach click handlers
        suggestions.querySelectorAll('.cat-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (id === '__create__') {
                    const name = btn.dataset.name;
                    selectedCategory = createCustomCategory(name);
                } else {
                    selectedCategory = id;
                }
                const catLabel = ALL_CATEGORIES.find(c => c.id === selectedCategory)?.label 
                    || customCategories.find(c => c.id === selectedCategory)?.label 
                    || selectedCategory;
                const finalIcon = CATEGORY_ICONS[selectedCategory] || CATEGORY_ICONS.other;
                const finalClass = getCategoryClass(selectedCategory);
                selectedDisplay.innerHTML = `<div class="cat-sug-icon category-icon-wrap ${finalClass}">${finalIcon}</div><span>${catLabel}</span>`;
                selectedDisplay.classList.remove('hidden');
                clearBtn.classList.remove('hidden');
                input.value = '';
                input.placeholder = '';
                suggestions.classList.add('hidden');
            });
        });
    });
    
    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) {
            suggestions.classList.remove('hidden');
        }
    });
    
    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.smart-category-wrap')) {
            suggestions.classList.add('hidden');
        }
    });
    
    // Clear button
    clearBtn?.addEventListener('click', () => {
        selectedCategory = 'food';
        selectedDisplay.classList.add('hidden');
        clearBtn.classList.add('hidden');
        input.placeholder = 'Type to search or create a category...';
    });
}

function setupPaymentMethodSelect() {
    const btns = document.querySelectorAll('.pay-method-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPayMethod = btn.dataset.method;
        });
    });
}

// ---- Recurring Toggle ----
function setupRecurringToggle() {
    toggleEl?.addEventListener('click', () => {
        isRecurringToggled = !isRecurringToggled;
        toggleEl.classList.toggle('active', isRecurringToggled);
    });
}

// ---- Render Transactions (Home) ----
function renderTransactions() {
    const list = document.getElementById('transactions-list');
    if (!list) return;
    
    const recentTx = TRANSACTIONS.slice(0, 5);
    list.innerHTML = recentTx.map(tx => createTransactionHTML(tx)).join('');
}

// ---- Render Full Transactions ----
function renderFullTransactions(filter = 'all') {
    const list = document.getElementById('full-transactions-list');
    if (!list) return;
    
    const filtered = filter === 'all' 
        ? TRANSACTIONS 
        : TRANSACTIONS.filter(tx => tx.category === filter);
    
    list.innerHTML = filtered.map(tx => createTransactionHTML(tx)).join('');
}

function createTransactionHTML(tx) {
    const isPositive = tx.amount > 0;
    const amountStr = isPositive ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`;
    const amountClass = isPositive ? 'positive' : 'negative';
    const catClass = getCategoryClass(tx.category);
    const icon = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS.other;
    const payIcons = { credit: '💳', debit: '🏦', cash: '💵', bank: '🏧' };
    const payLabels = { credit: 'Credit', debit: 'Debit', cash: 'Cash', bank: 'Bank' };
    const payIcon = payIcons[tx.payMethod] || '';
    const payLabel = payLabels[tx.payMethod] || tx.payMethod || '';
    const catLabel = ALL_CATEGORIES.find(c => c.id === tx.category)?.label || tx.category.charAt(0).toUpperCase() + tx.category.slice(1);
    
    return `
        <div class="transaction-item" data-id="${tx.id}">
            <div class="tx-icon category-icon-wrap ${catClass}">${icon}</div>
            <div class="tx-info">
                <div class="tx-name">${tx.name}</div>
                <div class="tx-meta"><span class="tx-category">${catLabel}</span>${payLabel ? `<span class="tx-pay-badge">${payIcon} ${payLabel}</span>` : ''}</div>
            </div>
            <div class="tx-amount-col">
                <div class="tx-amount ${amountClass}">${amountStr}</div>
                <div class="tx-time">${tx.time}</div>
            </div>
        </div>
    `;
}

// ---- Render Recurring Payments ----
function renderRecurringPayments() {
    const list = document.getElementById('recurring-list');
    if (!list) return;
    
    list.innerHTML = RECURRING_PAYMENTS.map(item => {
        const catClass = getCategoryClass(item.category || 'subscriptions');
        const icon = CATEGORY_ICONS[item.category || 'subscriptions'] || CATEGORY_ICONS.subscriptions;
        return `
        <div class="recurring-item ${item.upcoming ? 'upcoming' : ''}">
            <div class="recurring-icon category-icon-wrap ${catClass}">${icon}</div>
            <div class="recurring-info">
                <div class="recurring-name">${item.name}</div>
                <div class="recurring-next">Next: ${item.nextDate}</div>
                ${item.upcoming ? '<span class="upcoming-badge">Due soon</span>' : ''}
            </div>
            <div class="recurring-amount-col">
                <div class="recurring-amount">-$${item.amount.toFixed(2)}</div>
                <div class="recurring-freq">${item.frequency}</div>
            </div>
        </div>
    `;
    }).join('');
}

// ---- Spending Chart ----
function drawSpendingChart() {
    const canvas = document.getElementById('spending-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const data = CHART_DATA[currentPeriod];
    let values = data.values;
    
    // For month/year, sample down to ~7 points for display
    if (values.length > 10) {
        const step = Math.floor(values.length / 7);
        const sampled = [];
        for (let i = 0; i < values.length; i += step) {
            sampled.push(values[i]);
        }
        values = sampled.slice(0, 7);
    }
    
    const maxVal = Math.max(...values) * 1.2;
    const padding = { top: 10, bottom: 10, left: 0, right: 0 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    
    ctx.clearRect(0, 0, w, h);
    
    // Build points
    const points = values.map((v, i) => ({
        x: padding.left + (i / (values.length - 1)) * chartW,
        y: padding.top + chartH - (v / maxVal) * chartH,
    }));
    
    // Smooth curve
    function drawSmoothLine(pts) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        
        for (let i = 0; i < pts.length - 1; i++) {
            const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
            const cp1y = pts[i].y;
            const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
            const cp2y = pts[i + 1].y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pts[i + 1].x, pts[i + 1].y);
        }
    }
    
    // Gradient fill
    drawSmoothLine(points);
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.lineTo(points[0].x, h);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(117, 119, 245, 0.3)');
    gradient.addColorStop(0.5, 'rgba(117, 119, 245, 0.1)');
    gradient.addColorStop(1, 'rgba(117, 119, 245, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Line
    drawSmoothLine(points);
    const lineGradient = ctx.createLinearGradient(0, 0, w, 0);
    lineGradient.addColorStop(0, '#7577f5');
    lineGradient.addColorStop(1, '#22d3a7');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Dots
    points.forEach((p, i) => {
        if (i === points.length - 1) {
            // Glow on last point
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(117, 119, 245, 0.25)';
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = i === points.length - 1 ? '#7577f5' : 'rgba(117, 119, 245, 0.6)';
        ctx.fill();
        ctx.strokeStyle = '#141426';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Update labels
    updateChartLabels(data);
}

function updateChartLabels(data) {
    const labelsEl = document.getElementById('chart-labels');
    if (!labelsEl) return;
    
    let labels = data.labels;
    if (labels.length > 7) {
        const step = Math.floor(labels.length / 7);
        const sampled = [];
        for (let i = 0; i < labels.length; i += step) {
            sampled.push(labels[i]);
        }
        labels = sampled.slice(0, 7);
    }
    
    labelsEl.innerHTML = labels.map(l => `<span>${l}</span>`).join('');
}

// ---- Forecast Chart ----
function drawForecastChart() {
    const canvas = document.getElementById('forecast-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    
    // Actual spending (first 6 days)
    const actual = [120, 350, 580, 820, 1050, 1250];
    // Predicted (remaining days)
    const predicted = [1450, 1680, 1900, 2100, 2300, 2500, 2650, 2850];
    const budget = 3000;
    
    const allValues = [...actual, ...predicted];
    const maxVal = budget * 1.1;
    const padding = { top: 10, bottom: 20, left: 0, right: 0 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    
    ctx.clearRect(0, 0, w, h);
    
    // Budget line
    const budgetY = padding.top + chartH - (budget / maxVal) * chartH;
    ctx.beginPath();
    ctx.moveTo(0, budgetY);
    ctx.lineTo(w, budgetY);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Budget label
    ctx.font = '10px Inter';
    ctx.fillStyle = 'rgba(245, 72, 104, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('Budget $3,000', w, budgetY - 4);
    
    // Build all points
    const allPoints = allValues.map((v, i) => ({
        x: padding.left + (i / (allValues.length - 1)) * chartW,
        y: padding.top + chartH - (v / maxVal) * chartH,
    }));
    
    const actualPoints = allPoints.slice(0, actual.length);
    const predictedPoints = allPoints.slice(actual.length - 1);
    
    // Actual line
    ctx.beginPath();
    actualPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    const actualGradient = ctx.createLinearGradient(0, 0, actualPoints[actualPoints.length - 1].x, 0);
    actualGradient.addColorStop(0, '#7577f5');
    actualGradient.addColorStop(1, '#22d3a7');
    ctx.strokeStyle = actualGradient;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Predicted line (dashed)
    ctx.beginPath();
    predictedPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = 'rgba(34, 211, 167, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Fill under actual
    ctx.beginPath();
    actualPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(actualPoints[actualPoints.length - 1].x, h);
    ctx.lineTo(actualPoints[0].x, h);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
    fillGrad.addColorStop(0, 'rgba(117, 119, 245, 0.2)');
    fillGrad.addColorStop(1, 'rgba(117, 119, 245, 0)');
    ctx.fillStyle = fillGrad;
    ctx.fill();
    
    // Current point
    const lastActual = actualPoints[actualPoints.length - 1];
    ctx.beginPath();
    ctx.arc(lastActual.x, lastActual.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34, 211, 167, 0.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastActual.x, lastActual.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#22d3a7';
    ctx.fill();
    
    // "Today" label
    ctx.font = '10px Inter';
    ctx.fillStyle = 'rgba(34, 211, 167, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('Today', lastActual.x, lastActual.y + 16);
}

// ---- Scanner ----
function setupScanner() {
    scanBtn?.addEventListener('click', simulateScan);
    document.getElementById('btn-upload-receipt')?.addEventListener('click', simulateScan);
    document.getElementById('btn-save-scan')?.addEventListener('click', () => {
        scanResult?.classList.add('hidden');
        scannerPreview?.classList.remove('hidden');
        scanLine?.classList.remove('active');
        showToast('Transaction saved!', 'success');
    });
    document.getElementById('btn-edit-scan')?.addEventListener('click', () => {
        scanResult?.classList.add('hidden');
        scannerPreview?.classList.remove('hidden');
        scanLine?.classList.remove('active');
        openModal();
        // Pre-fill with scanned data
        document.getElementById('tx-amount').value = '67.43';
        document.getElementById('tx-description').value = 'Whole Foods Market';
    });
}

function simulateScan() {
    // Show scanning animation
    scanLine?.classList.add('active');
    
    // After 2.5 seconds, show result
    setTimeout(() => {
        scanLine?.classList.remove('active');
        scannerPreview?.classList.add('hidden');
        scanResult?.classList.remove('hidden');
    }, 2500);
}

// ---- Form Submit ----
function setupFormSubmit() {
    document.getElementById('add-tx-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('tx-amount').value;
        const desc = document.getElementById('tx-description').value;
        const submitBtn = e.target.querySelector('button[type="submit"]') || document.getElementById('btn-save-tx');
        
        if (amount && desc) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const amt = parseFloat(amount);
            const signedAmount = currentTxType === 'income' ? Math.abs(amt) : -Math.abs(amt);
            
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            if (hours > 12) hours -= 12;
            if (hours === 0) hours = 12;
            const timeStr = `${hours}:${minutes} ${ampm}`;

            const txData = {
                amount: signedAmount,
                description: desc,
                category: selectedCategory,
                pay_method: selectedPayMethod,
                time: timeStr,
                date: document.getElementById('tx-date').value || new Date().toISOString().split('T')[0]
            };

            const savedDbTx = await saveTransactionToCloud(txData);
            
            submitBtn.disabled = false;
            if (submitBtn.id === 'btn-save-tx') submitBtn.textContent = 'Save';

            if (savedDbTx) {
                closeModal();
                const payLabels = { credit: 'Credit Card', debit: 'Debit Card', cash: 'Cash', bank: 'Bank Transfer' };
                showToast(`Added: ${desc} — $${Math.abs(amt).toFixed(2)}`, 'success');
                
                // Add to local UI array to reflect immediately
                TRANSACTIONS.unshift({
                    ...savedDbTx,
                    name: savedDbTx.description,
                    payMethod: savedDbTx.pay_method
                });
                
                renderTransactions();
                renderFullTransactions();
                
                // Reset form state
                e.target.reset();
                selectedCategory = 'food';
                selectedPayMethod = 'credit';
                const selectedDisplay = document.getElementById('selected-category-display');
                const clearBtn = document.getElementById('clear-category');
                if (selectedDisplay) selectedDisplay.classList.add('hidden');
                if (clearBtn) clearBtn.classList.add('hidden');
                const catInput = document.getElementById('category-input');
                if (catInput) catInput.placeholder = 'Type to search or create a category...';
                document.querySelectorAll('.pay-method-btn').forEach((b, i) => {
                    b.classList.toggle('active', i === 0);
                });
            }
        }
    });
}

// ---- Toast ----
function showToast(message, type = 'success') {
    // Remove existing toast
    document.querySelector('.toast')?.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon ${type}">
            ${type === 'success' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'}
        </div>
        <span>${message}</span>
    `;
    
    document.getElementById('app-container').appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ---- Balance Animation ----
function animateBalanceOnLoad() {
    const amountEl = document.getElementById('balance-amount');
    if (!amountEl) return;
    
    const target = 4280;
    let current = 0;
    const duration = 1500;
    const startTime = performance.now();
    
    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.floor(target * eased);
        amountEl.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// ---- Search Transactions ----
document.getElementById('search-transactions')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const list = document.getElementById('full-transactions-list');
    if (!list) return;
    
    const filtered = TRANSACTIONS.filter(tx => 
        tx.name.toLowerCase().includes(query) || 
        tx.category.toLowerCase().includes(query)
    );
    
    list.innerHTML = filtered.map(tx => createTransactionHTML(tx)).join('');
});

// ---- Resize Chart on window resize ----
window.addEventListener('resize', () => {
    drawSpendingChart();
    drawForecastChart();
});

// ============================================
//  VOICE INPUT — Speech Recognition & Parser
// ============================================

function setupVoiceInput() {
    const voiceBtn = document.getElementById('btn-voice-input');
    const overlay = document.getElementById('voice-overlay');
    const closeBtn = document.getElementById('voice-close');
    const listeningEl = document.getElementById('voice-listening');
    const confirmEl = document.getElementById('voice-confirm');
    const statusEl = document.getElementById('voice-status');
    const transcriptEl = document.getElementById('voice-transcript');
    const finalTranscriptEl = document.getElementById('voice-final-transcript');
    const retryBtn = document.getElementById('voice-retry');
    const editBtn = document.getElementById('voice-edit');
    const saveBtn = document.getElementById('voice-confirm-save');
    
    if (!voiceBtn || !overlay) return;
    
    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        voiceBtn.addEventListener('click', () => {
            showToast('Voice input is not supported in this browser. Try Chrome or Edge.', 'error');
        });
        return;
    }
    
    let recognition = null;
    let parsedData = {};
    
    function openVoiceOverlay() {
        // Close the add transaction modal first
        closeModal();
        setTimeout(() => {
            overlay.classList.remove('hidden');
            listeningEl.classList.remove('hidden');
            confirmEl.classList.add('hidden');
            transcriptEl.textContent = '';
            statusEl.textContent = 'Listening...';
            statusEl.classList.remove('error');
            startRecognition();
        }, 300);
    }
    
    function closeVoiceOverlay() {
        stopRecognition();
        overlay.classList.add('hidden');
    }
    
    function startRecognition() {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;
        
        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += t;
                } else {
                    interim += t;
                }
            }
            
            // Show live transcript
            transcriptEl.textContent = final || interim;
            
            if (final) {
                // Parse and show confirmation
                parsedData = parseVoiceInput(final);
                showConfirmation(final, parsedData);
            }
        };
        
        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                statusEl.textContent = 'No speech detected. Tap to try again.';
                statusEl.classList.add('error');
            } else if (event.error === 'not-allowed') {
                statusEl.textContent = 'Microphone access denied.';
                statusEl.classList.add('error');
            } else {
                statusEl.textContent = `Error: ${event.error}`;
                statusEl.classList.add('error');
            }
        };
        
        recognition.onend = () => {
            // If we didn't get a final result and we're still on the listening screen
            if (!confirmEl.classList.contains('hidden')) return;
            const currentText = transcriptEl.textContent.trim();
            if (currentText) {
                parsedData = parseVoiceInput(currentText);
                showConfirmation(currentText, parsedData);
            }
        };
        
        try {
            recognition.start();
        } catch (e) {
            statusEl.textContent = 'Could not start listening.';
            statusEl.classList.add('error');
        }
    }
    
    function stopRecognition() {
        if (recognition) {
            try { recognition.abort(); } catch(e) {}
            recognition = null;
        }
    }
    
    function showConfirmation(transcript, data) {
        listeningEl.classList.add('hidden');
        confirmEl.classList.remove('hidden');
        
        finalTranscriptEl.textContent = `"${transcript}"`;
        document.getElementById('voice-parsed-amount').textContent = data.amount ? `$${data.amount.toFixed(2)}` : 'Not detected';
        document.getElementById('voice-parsed-desc').textContent = data.description || 'Not detected';
        
        const catLabel = ALL_CATEGORIES.find(c => c.id === data.category)?.label || data.category || 'Auto-detect';
        document.getElementById('voice-parsed-cat').textContent = catLabel;
        
        const payLabels = { credit: 'Credit Card', debit: 'Debit Card', cash: 'Cash', bank: 'Bank Transfer' };
        document.getElementById('voice-parsed-pay').textContent = payLabels[data.payMethod] || 'Credit Card';
    }
    
    // Event listeners
    voiceBtn.addEventListener('click', openVoiceOverlay);
    closeBtn.addEventListener('click', closeVoiceOverlay);
    
    retryBtn.addEventListener('click', () => {
        listeningEl.classList.remove('hidden');
        confirmEl.classList.add('hidden');
        transcriptEl.textContent = '';
        statusEl.textContent = 'Listening...';
        statusEl.classList.remove('error');
        startRecognition();
    });
    
    editBtn.addEventListener('click', () => {
        closeVoiceOverlay();
        // Pre-fill the form with parsed data
        setTimeout(() => {
            openModal();
            if (parsedData.amount) document.getElementById('tx-amount').value = parsedData.amount.toFixed(2);
            if (parsedData.description) document.getElementById('tx-description').value = parsedData.description;
        }, 350);
    });
    
    saveBtn.addEventListener('click', () => {
        if (!parsedData.amount && !parsedData.description) {
            showToast('Could not parse transaction. Try again.', 'error');
            return;
        }
        
        const cat = parsedData.category || 'other';
        const pay = parsedData.payMethod || 'credit';
        
        TRANSACTIONS.unshift({
            id: TRANSACTIONS.length + 1,
            name: parsedData.description || 'Voice Transaction',
            category: cat,
            payMethod: pay,
            amount: -(parsedData.amount || 0),
            time: 'Just now',
            date: 'Today',
        });
        
        closeVoiceOverlay();
        renderTransactions();
        renderFullTransactions();
        saveTransactionsLocal();
        const payLabels = { credit: 'Credit Card', debit: 'Debit Card', cash: 'Cash', bank: 'Bank Transfer' };
        showToast(`Voice added: ${parsedData.description || 'Transaction'} — $${(parsedData.amount || 0).toFixed(2)}`, 'success');
    });
}

// ---- Voice Input Parser ----
function parseVoiceInput(text) {
    const lower = text.toLowerCase();
    const result = { amount: null, description: '', category: null, payMethod: null };
    
    // 1. Extract amount
    const amountPatterns = [
        /\$(\d+(?:\.\d{1,2})?)/,                          // $25.50
        /(\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)/,       // 25 dollars / 25 bucks
        /(?:spent|paid|cost|for|of)\s*\$?(\d+(?:\.\d{1,2})?)/i,  // spent 25
        /(\d+(?:\.\d{1,2})?)\s*(?:on|at|to)/,              // 25 on lunch
    ];
    
    for (const pattern of amountPatterns) {
        const match = lower.match(pattern);
        if (match) {
            result.amount = parseFloat(match[1]);
            break;
        }
    }
    
    // 2. Extract payment method
    if (/credit\s*card|credit/i.test(lower)) result.payMethod = 'credit';
    else if (/debit\s*card|debit/i.test(lower)) result.payMethod = 'debit';
    else if (/\bcash\b/i.test(lower)) result.payMethod = 'cash';
    else if (/bank\s*(?:transfer|account)?|wire/i.test(lower)) result.payMethod = 'bank';
    else result.payMethod = 'credit'; // default
    
    // 3. Extract category using the keyword engine
    let bestCat = null;
    let bestScore = 0;
    for (const [catId, keywords] of Object.entries(ICON_KEYWORDS)) {
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                score += kw.length; // Longer keyword matches weighted higher
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestCat = catId;
        }
    }
    result.category = bestCat || 'other';
    
    // 4. Extract description (the core of what was said, cleaned up)
    let desc = text;
    // Remove amount references
    desc = desc.replace(/\$\d+(\.\d{1,2})?/g, '');
    desc = desc.replace(/\d+(\.\d{1,2})?\s*(dollars?|bucks?)/gi, '');
    // Remove payment method references
    desc = desc.replace(/\b(with|using|via|by)\s+(credit\s*card|debit\s*card|cash|bank\s*transfer|bank)\b/gi, '');
    // Remove filler words
    desc = desc.replace(/\b(spent|paid|i|for|on|at|to|the|a|an|about|around|just|my)\b/gi, '');
    // Clean up
    desc = desc.replace(/\s+/g, ' ').trim();
    // Capitalize first letter
    if (desc) desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    result.description = desc || 'Transaction';
    
    return result;
}
