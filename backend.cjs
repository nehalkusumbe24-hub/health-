const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'ayurveda-secret-key-2025-secure';
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors({
    origin: ['https://finalyear-eta.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- Database Logic ---
let data = {
    profiles: [],
    doctors: [],
    patients: [],
    appointments: [],
    medical_records: [],
    chat_messages: [],
    auth_users: [],
    assessments: [],
    diet_plans: [],
    exercise_plans: [],
    habit_tracking: [],
    prescriptions: [],
    login_logs: [],        // ← NEW: tracks every login attempt
};

function initDb() {
    if (fs.existsSync(DB_FILE)) {
        try {
            const loaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            data = { ...data, ...loaded };
            for (const key of Object.keys(data)) {
                if (!data[key]) data[key] = [];
            }
            saveDb();
        } catch (e) {
            saveDb();
        }
    } else {
        saveDb();
    }
}

function saveDb() {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

initDb();

// --- Auth Middleware ---
const verifyAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Helper to get real client IP
function getClientIp(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown'
    );
}

// --- Auth Routes ---

// SIGNUP
app.post('/auth/signup', async (req, res) => {
    const { email, password, full_name, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existingUser = data.auth_users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ error: 'User already exists with this email' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create auth user, profile, and patient records
    data.auth_users.push({ id, email, phone: phone || '', password_hash, created_at: now });
    data.profiles.push({
        id,
        email,
        phone: phone || '',
        full_name: full_name || '',
        is_doctor: false,
        role: 'user',
        created_at: now,
    });
    data.patients.push({ id: crypto.randomUUID(), user_id: id, created_at: now });

    // Log the signup as a login_log entry
    data.login_logs.push({
        id: crypto.randomUUID(),
        user_id: id,
        email,
        phone: phone || null,
        action: 'signup',
        status: 'success',
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent'] || 'unknown',
        timestamp: now,
    });

    saveDb();

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, email, full_name: full_name || '', role: 'user' } });
});

// LOGIN
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const now = new Date().toISOString();
    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || 'unknown';

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    console.log(`[AUTH] Login attempt for: ${email}`);
    const user = data.auth_users.find(u => u.email === (email || "").toLowerCase().trim());

    if (!user) {
        // Log failed attempt
        data.login_logs.push({
            id: crypto.randomUUID(),
            user_id: null,
            email,
            phone: null,
            action: 'login',
            status: 'failed_not_found',
            ip_address: ip,
            user_agent: ua,
            timestamp: now,
        });
        saveDb();
        return res.status(400).json({ error: 'No account found with this email' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
        // Log failed attempt
        data.login_logs.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            email,
            phone: user.phone || null,
            action: 'login',
            status: 'failed_wrong_password',
            ip_address: ip,
            user_agent: ua,
            timestamp: now,
        });
        saveDb();
        return res.status(400).json({ error: 'Incorrect password' });
    }

    // Log successful login
    data.login_logs.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        email: user.email,
        phone: user.phone || null,
        action: 'login',
        status: 'success',
        ip_address: ip,
        user_agent: ua,
        timestamp: now,
    });
    saveDb();

    // Get profile for role info
    const profile = data.profiles.find(p => p.id === user.id) || {};
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            full_name: profile.full_name || '',
            phone: user.phone || '',
            role: profile.role || 'user',
        }
    });
});

// GET Login Logs (admin only, but no role check here for simplicity)
app.get('/api/login-logs', verifyAuth, (req, res) => {
    const logs = [...data.login_logs].reverse(); // newest first
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    res.json(logs.slice(0, limit));
});

// --- API Routes ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/api/upload', verifyAuth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/api/data/:table', verifyAuth, (req, res) => {
    const table = data[req.params.table];
    if (!table) return res.status(404).json({ error: 'Table not found' });
    let results = [...table];
    for (const [key, value] of Object.entries(req.query)) {
        if (key !== 'limit' && key !== 'order') {
            results = results.filter(item => String(item[key]) === String(value));
        }
    }
    if (req.query.limit) results = results.slice(0, parseInt(req.query.limit));
    res.json(results);
});

app.get('/api/data/:table/:id', verifyAuth, (req, res) => {
    const table = data[req.params.table];
    const item = table?.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
});

app.post('/api/data/:table', verifyAuth, (req, res) => {
    if (!data[req.params.table]) data[req.params.table] = [];
    const table = data[req.params.table];
    const item = { ...req.body, id: req.body.id || crypto.randomUUID(), created_at: new Date().toISOString() };
    table.push(item);
    saveDb();
    res.status(201).json(item);
});

app.put('/api/data/:table/:id', verifyAuth, (req, res) => {
    const table = data[req.params.table];
    if (!table) return res.status(404).json({ error: 'Table not found' });
    const index = table.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    table[index] = { ...table[index], ...req.body };
    saveDb();
    res.json(table[index]);
});

app.delete('/api/data/:table/:id', verifyAuth, (req, res) => {
    const table = data[req.params.table];
    if (!table) return res.status(404).json({ error: 'Table not found' });
    const index = table.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    table.splice(index, 1);
    saveDb();
    res.json({ success: true });
});

// --- Ayurvedic Knowledge Base ---
const ayurvedicKnowledge = [
    { keywords: ['vata', 'vata dosha'], answer: "🌬️ **Vata Dosha** (Air + Space)\n\nCreative, quick-thinking, energetic. When imbalanced: anxiety, dry skin, constipation, insomnia.\n\n**Balance with:**\n• Warm, cooked, slightly oily foods (ghee, sesame oil)\n• Regular daily routine — same wake/sleep times\n• Warm herbal teas: ginger, licorice, cinnamon\n• Grounding yoga: Tree Pose, Child's Pose, forward bends\n• Sesame oil self-massage (Abhyanga) daily" },
    { keywords: ['pitta', 'pitta dosha'], answer: "🔥 **Pitta Dosha** (Fire + Water)\n\nSharp, intelligent, driven. When imbalanced: irritability, inflammation, heartburn, skin rashes.\n\n**Balance with:**\n• Cooling foods: cucumber, coconut, mint, coriander\n• Avoid spicy, fried, sour, and fermented foods\n• Coconut oil self-massage\n• Cooling pranayama: Sheetali, Sitali breathing\n• Moonlight walks, swimming, gentle yoga" },
    { keywords: ['kapha', 'kapha dosha'], answer: "🌊 **Kapha Dosha** (Earth + Water)\n\nNurturing, calm, stable. When imbalanced: weight gain, congestion, lethargy, slow digestion.\n\n**Balance with:**\n• Light, warm, dry, spicy foods\n• Vigorous daily exercise — Sun Salutations, running\n• Wake before 6 AM — avoid daytime naps\n• Dry brushing (Garshana) before bathing\n• Eucalyptus or rosemary essential oils" },
    { keywords: ['dosha', 'what is dosha', 'doshas', 'constitution', 'prakriti'], answer: "🌿 **The Three Doshas:**\n\n1. **Vata** (Air + Space) — Movement, creativity, communication\n2. **Pitta** (Fire + Water) — Metabolism, digestion, intelligence\n3. **Kapha** (Earth + Water) — Structure, lubrication, stability\n\nEveryone has a unique mix called **Prakriti** (constitution). Imbalance (Vikriti) causes disease. Ayurveda restores balance through diet, lifestyle & herbs." },
    { keywords: ['diet', 'food', 'eat', 'nutrition', 'meal', 'eating'], answer: "🍽️ **Ayurvedic Diet Principles:**\n\n• Largest meal at **noon** when Agni is strongest\n• Include all **6 tastes** per meal: sweet, sour, salty, bitter, pungent, astringent\n• Eat warm, freshly cooked food — avoid processed/packaged\n• No cold drinks with meals — warm water only\n• Key spices: turmeric, cumin, ginger, coriander, fennel\n• Don't eat until previous meal is digested (3 hrs gap)\n• Eat mindfully — no screens, no stress" },
    { keywords: ['sleep', 'insomnia', 'rest', 'sleeping', 'sleepless'], answer: "😴 **Ayurvedic Sleep Remedies:**\n\n• Bed by **10 PM** (Kapha time for deepest sleep)\n• Warm milk + pinch of nutmeg + cardamom at bedtime\n• Brahmi or Ashwagandha herb before sleep\n• Foot massage with warm sesame or brahmi oil\n• Avoid screens 1 hour before sleep\n• Yoga Nidra meditation (20 min) before bed\n• Keep bedroom cool, dark and quiet" },
    { keywords: ['stress', 'anxiety', 'tension', 'worry', 'mental health', 'depression'], answer: "🧘 **Ayurvedic Stress & Anxiety Relief:**\n\n• **Ashwagandha** — adaptogen, reduces cortisol\n• **Brahmi** — calms the mind, boosts memory\n• **Jatamansi** — natural tranquilizer herb\n• **Nadi Shodhana** pranayama — 10 min daily\n• **Abhyanga** — warm oil self-massage calms nervous system\n• **Meditation** — start with 10 minutes of breath awareness\n• Marigold or lavender aromatherapy at bedtime" },
    { keywords: ['yoga', 'asana', 'pose', 'exercise', 'workout', 'flexibility'], answer: "🧘‍♀️ **Dosha-Based Yoga:**\n\n**Vata** (calm & ground): Child's Pose, Tree, forward bends — slow with deep breathing\n**Pitta** (cool & release): Moon Salutation, Camel, Fish Pose — avoid overheating\n**Kapha** (energize): Sun Salutations x10, Warrior I/II, backbends — fast-paced\n\n**Daily:** 20-30 min asana + 10 min pranayama + 5 min meditation" },
    { keywords: ['pranayama', 'breathing', 'breath', 'breathwork'], answer: "🌬️ **Key Pranayama Techniques:**\n\n1. **Nadi Shodhana** — alternate nostril; balances brain, reduces stress\n2. **Bhramari** — bee humming breath; relieves anxiety instantly\n3. **Kapalabhati** — skull shining; energizes, cleanses lungs\n4. **Sheetali** — cooling breath; great for Pitta and fever\n5. **Ujjayi** — ocean breath; builds heat, focuses mind\n\n*Practice 5-15 minutes daily, empty stomach, morning preferred*" },
    { keywords: ['digestion', 'stomach', 'gut', 'constipation', 'bloating', 'acidity', 'ibs'], answer: "🔥 **Ayurvedic Gut Health:**\n\n• **Agni (Digestive Fire)** = key to all health\n• Fresh ginger + rock salt before meals ignites Agni\n• **CCF Tea** (Cumin + Coriander + Fennel) — sip after meals\n• **Triphala** at bedtime — gentle cleanse + regularity\n• Avoid incompatible combos: milk + fruit, fish + dairy\n• Walk 100 steps (Shatapavali) after lunch\n• Avoid eating when stressed or standing" },
    { keywords: ['blood pressure', 'hypertension', 'bp', 'high bp'], answer: "❤️ **Ayurvedic Remedies for High Blood Pressure:**\n\n• **Sarpagandha (Rauwolfia)** — classical herb for hypertension\n• **Arjuna bark** tea — strengthens heart muscle\n• **Garlic** — 2 raw cloves daily on empty stomach\n• **Triphala** — reduces arterial plaque\n• Reduce salt, sour, and spicy foods (Pitta aggravators)\n• Practice Nadi Shodhana pranayama 15 min twice daily\n• Avoid anger, overwork, and screen time late at night\n• Pomegranate juice daily supports heart health" },
    { keywords: ['diabetes', 'sugar', 'blood sugar', 'insulin', 'diabetic'], answer: "🩺 **Ayurvedic Approach to Diabetes (Madhumeha):**\n\n• **Bitter Gourd (Karela)** juice — 30ml on empty stomach daily\n• **Fenugreek seeds** — soak overnight, eat in morning\n• **Gurmar (Gymnema)** — reduces sugar cravings\n• **Vijaysar wood** — soak overnight in wood cup, drink water\n• **Jamun seeds** powder — lowers blood sugar naturally\n• Avoid sweets, refined carbs, white rice, potatoes\n• Eat: bitter gourd, turmeric, cinnamon, barley\n• Walk 30 min after every meal\n\n⚠️ Always continue prescribed medications and consult doctor." },
    { keywords: ['joint', 'arthritis', 'pain', 'knee', 'inflammation', 'ache', 'backache', 'back pain'], answer: "🦴 **Ayurvedic Joint & Pain Relief:**\n\n• **Shallaki (Boswellia)** — powerful anti-inflammatory for joints\n• **Guggul** — reduces joint swelling and cholesterol\n• **Mahanarayan oil** — warm massage on painful joints\n• **Nirgundi leaves** — boil and apply as poultice\n• Castor oil (1 tsp at bedtime) lubricates joints\n• Turmeric + black pepper + warm milk (Golden Milk) daily\n• Avoid cold, dry, stale foods — increase ghee and sesame\n• Gentle Vata-pacifying yoga: never strain joints" },
    { keywords: ['cholesterol', 'heart', 'cardiac', 'cardiovascular', 'arteries'], answer: "💓 **Ayurvedic Heart & Cholesterol Health:**\n\n• **Arjuna** — #1 herb for heart; take as churna or tea\n• **Guggul** — reduces LDL, triglycerides significantly\n• **Garlic + Ginger** — daily for arterial health\n• **Triphala** — removes ama (toxins) from blood vessels\n• Flaxseed, walnuts, almonds daily in small amounts\n• Avoid heavy, fried, and processed foods\n• Evening walk 30 min + morning yoga\n• Pomegranate juice reduces arterial inflammation" },
    { keywords: ['fever', 'temperature', 'flu', 'viral', 'infection', 'cold', 'cough', 'sore throat'], answer: "🌡️ **Ayurvedic Cold, Cough & Fever Remedies:**\n\n• **Tulsi (Holy Basil) tea** — 5-6 leaves + ginger + black pepper + honey\n• **Giloy (Guduchi)** — boosts immunity, reduces fever fast\n• **Sitopaladi churna** — classical formula for cold/cough\n• **Steam inhalation** with eucalyptus oil or ajwain (carom seeds)\n• Warm water with honey + ginger juice every 2 hours\n• **Sesame oil Nasya** — 2 drops in each nostril prevents infections\n• Rest, fasting (light khichdi only), warmth\n• Avoid cold foods, dairy, sweets during illness" },
    { keywords: ['headache', 'migraine', 'head pain', 'temple pain'], answer: "🤕 **Ayurvedic Headache & Migraine Relief:**\n\n• **Brahmi** paste — apply on forehead for instant cooling\n• **Peppermint oil** — massage on temples and back of neck\n• **Nasya** — 2 drops warm sesame oil in each nostril\n• Avoid Pitta-aggravating foods: spicy, sour, hot\n• Stay hydrated — drink warm water sipped slowly\n• **Shirodhara** (oil flow on forehead) — for chronic migraines\n• Practice Sheetali pranayama (cooling breath)\n• Sleep in cool, dark room; avoid screen glare" },
    { keywords: ['skin', 'acne', 'glow', 'complexion', 'beauty', 'pimple', 'pigmentation', 'dark spot'], answer: "✨ **Ayurvedic Skin Care & Glow Remedies:**\n\n• **Turmeric + sandalwood paste** — apply for 15 min, glowing skin\n• **Neem paste** — clears acne, purifies blood\n• **Aloe vera gel** — soothes inflammation and moisturizes\n• **Rose water** toner — balances skin pH\n• **Manjistha** herb — blood purifier for skin glow\n• Drink warm lemon water every morning\n• Reduce sugar, dairy, and fried foods (main acne triggers)\n• **Kumkumadi tailam** — premium oil for pigmentation & glow\n• Adequate sleep — skin repairs 11PM–3AM" },
    { keywords: ['hair', 'hair loss', 'baldness', 'dandruff', 'hair growth', 'thin hair'], answer: "💇 **Ayurvedic Hair Care Remedies:**\n\n• **Bhringraj oil** — #1 herb for hair growth; massage 2x/week\n• **Amla (Indian Gooseberry)** — eat fresh or drink juice daily\n• **Brahmi + Neem shampoo** — reduces dandruff naturally\n• **Hibiscus flower paste** — conditions and prevents hair fall\n• **Methi (Fenugreek) seeds** — soak + grind, apply as mask\n• Eat: iron-rich foods, dates, green leafy vegetables\n• Avoid shampoo daily — overwashes natural oils\n• Stress is the #1 cause of hair fall — manage with yoga" },
    { keywords: ['weight', 'lose weight', 'obesity', 'fat', 'overweight', 'slim', 'belly'], answer: "⚖️ **Ayurvedic Weight Loss Approach:**\n\n• **Triphala** — take 1 tsp with warm water at bedtime\n• **Trikatu** (ginger + pepper + long pepper) — boosts metabolism\n• **Garcinia (Vrukshamla)** — natural appetite suppressant\n• Honey + warm water + lemon every morning\n• Main eating window: 7AM–7PM; skip late-night eating\n• **Kapalabhati** pranayama — 10 min daily burns belly fat\n• Vigorous exercise: Sun Salutations x12 daily\n• Avoid cold drinks, ice cream, sweets, white rice\n• Eat: moong dal, barley, millet, bitter gourd, green leafy vegs" },
    { keywords: ['immunity', 'immune', 'resistance', 'ojas', 'strong body'], answer: "🛡️ **Build Immunity (Ojas) with Ayurveda:**\n\n• **Chyawanprash** — 1 tsp daily on empty stomach (all ages)\n• **Guduchi (Giloy)** — boosts white blood cells significantly\n• **Tulsi** — chew 5 leaves every morning\n• **Ashwagandha** — adaptogen, builds strength and ojas\n• **Turmeric milk (Golden Milk)** nightly\n• **Amalaki (Amla)** — richest natural Vitamin C source\n• Adequate sleep 7-8 hrs and daily sun exposure\n• Avoid sugar, processed food, alcohol — they destroy immunity" },
    { keywords: ['liver', 'liver health', 'fatty liver', 'jaundice', 'hepatitis'], answer: "🫀 **Ayurvedic Liver Health:**\n\n• **Bhumyamalaki** — #1 liver-protective herb in Ayurveda\n• **Kutki (Picrorhiza)** — regenerates liver cells, treats jaundice\n• **Punarnava** — reduces liver inflammation\n• **Aloe vera juice** — 30ml before breakfast daily\n• Avoid alcohol, excess sugar, fried food completely\n• Eat: bitter gourd, papaya, beets, leafy greens\n• **Arogyavardhini vati** — classical tablet for liver disorders\n• Warm lemon water every morning flushes liver toxins" },
    { keywords: ['kidney', 'kidney stone', 'urinary', 'uti', 'renal'], answer: "🫘 **Ayurvedic Kidney & Urinary Health:**\n\n• **Punarnava** — best herb for kidney health, reduces swelling\n• **Gokshura (Tribulus)** — dissolves kidney stones, supports UTI\n• **Varuna** — breaks down calcium oxalate stones\n• Drink **coconut water** daily — natural kidney flush\n• Increase water intake to 3 liters daily\n• Avoid excess salt, protein, and oxalate-rich foods (spinach, nuts)\n• Barley water + celery juice — gentle kidney flush\n• Avoid holding urine — go when you feel the urge" },
    { keywords: ['memory', 'brain', 'focus', 'concentration', 'alzheimer', 'sharp mind', 'study'], answer: "🧠 **Ayurvedic Brain & Memory Boosters:**\n\n• **Brahmi (Bacopa)** — #1 herb for memory and intelligence\n• **Shankhapushpi** — enhances learning capacity\n• **Ashwagandha** — reduces brain fog, protects neurons\n• **Saffron (Kesar)** in warm milk — sharp memory\n• Regular **Nasya** — 2 drops brahmi oil in each nostril\n• Avoid multi-tasking, overthinking — rest the mind\n• **Meditation** — the best brain exercise (10-20 min daily)\n• Eat: walnuts (brain-shaped for reason!), almonds soaked overnight, ghee" },
    { keywords: ['menstrual', 'period', 'pcod', 'pcos', 'irregular periods', 'cramps', 'women', 'hormones'], answer: "🌺 **Ayurvedic Women's Health & Menstrual Care:**\n\n• **Shatavari** — queen herb for women; balances hormones\n• **Ashoka bark** — regulates menstrual cycle\n• **Lodhra** — treats PCOD/PCOS symptoms\n• Sesame seeds (til) + jaggery during periods — relieves cramps\n• Avoid cold water, cold foods during menstruation\n• **Warm castor oil** massage on lower abdomen for cramps\n• Practice restorative yoga during periods — avoid inversions\n• Maintain healthy weight — key for hormonal balance\n• Triphala regularly detoxes reproductive system" },
    { keywords: ['detox', 'cleanse', 'toxin', 'ama', 'panchakarma', 'cleansing'], answer: "🌿 **Ayurvedic Detox & Cleansing:**\n\n• **Panchakarma** — 5-therapy detox program (seek qualified practitioner)\n• **Triphala** nightly — gentle everyday internal cleanse\n• **Kitchari fast** — mung dal + rice + ghee + spices; 1-3 days\n• Warm lemon water + ginger every morning clears ama\n• **Dry brushing (Garshana)** before bath removes toxins from skin\n• **Tongue scraping** every morning removes overnight ama\n• Sweat daily — exercise, sauna, or hot bath with Epsom salt\n• Seasonal detox: light kitchari diet during season-changes" },
    { keywords: ['turmeric', 'haldi', 'golden milk', 'golden latte'], answer: "✨ **Turmeric — The Golden Healer:**\n\n• Contains **curcumin** — powerful anti-inflammatory compound\n• **Golden Milk recipe:** Warm milk + 1/2 tsp turmeric + pinch black pepper + ghee + honey\n• Boosts immunity, reduces inflammation\n• Heals wounds when applied topically as paste\n• Supports liver function and detox\n• Improves digestion when added to cooking\n• Best absorbed with **black pepper** (increases bioavailability 2000%!)\n• Take 1/4 to 1/2 tsp daily in food or milk" },
    { keywords: ['ashwagandha', 'withania', 'adaptogen'], answer: "💪 **Ashwagandha — The Strength Herb:**\n\n• Reduces **cortisol** (stress hormone) significantly\n• Improves strength, stamina, and muscle mass\n• Balances thyroid hormones (both hypo and hyper)\n• Boosts testosterone and reproductive health in men\n• Improves sleep quality when taken at night with milk\n• Enhances immunity and builds Ojas (vital energy)\n\n**How to take:** 1/4 to 1/2 tsp with warm milk at bedtime OR capsule form 300-600mg daily\n⚠️ Avoid during pregnancy" },
    { keywords: ['triphala', 'bowel', 'cleanse bowel', 'digestive tonic'], answer: "🌿 **Triphala — The Three-Fruit Wonder:**\n\nMade of: **Amalaki + Bibhitaki + Haritaki**\n\n• Gentle daily detox and bowel regulator\n• Rich in Vitamin C and antioxidants\n• Improves eye health when used as eyewash\n• Reduces cholesterol and blood sugar gradually\n• Anti-aging, rejuvenating (rasayana) herb\n\n**How to take:** 1/2 tsp powder with warm water at bedtime — or as tablet after dinner. Safe long-term for most people." },
    { keywords: ['seasonal', 'season', 'monsoon', 'winter', 'summer', 'spring', 'autumn'], answer: "🍂 **Seasonal (Ritucharya) Ayurvedic Tips:**\n\n**Summer (Grishma):** Cooling foods, coconut water, avoid sun during peak hours, mint/coriander/cucumber diet\n\n**Monsoon (Varsha):** Immunity boosters, avoid raw salads, light meals, Triphala and ginger tea to counter Vata aggravation\n\n**Autumn/Winter (Sharad + Hemanta):** Warm sesame oil abhyanga, heavier nutritious foods, ghee, milk, root vegetables\n\n**Spring (Vasanta):** Kapha detox season — light fasting, bitter herbs, vigorous exercise, reduce sweets" },
    { keywords: ['fasting', 'fast', 'ekadashi', 'intermittent', 'upavasa'], answer: "⏱️ **Ayurvedic Fasting (Upavasa) Guidance:**\n\n• Fasting gives Agni (digestive fire) a rest and burns ama (toxins)\n• **Ekadashi fast** (11th lunar day) — very auspicious, improves digestion\n• **Kitchari day** — eat only kitchari (mung dal + rice) once a week\n• **Fruit fast** — only fruits for 1 day monthly\n• Always break a fast with light foods: fruit, warm soup, khichdi\n• Drink warm water and herbal teas during fasting\n• Avoid prolonged fasting if Vata type — it worsens imbalance\n• Fasting improves: digestion, energy, mental clarity" },
    { keywords: ['children', 'kids', 'baby', 'infant', 'child health', 'toddler'], answer: "👶 **Ayurvedic Tips for Children's Health:**\n\n• **Chyawanprash** — 1/2 tsp daily for immune strength (age 2+)\n• **Abhyanga** (oil massage) for infants — promotes growth and sleep\n• **Brahmi ghrita** — improves memory and focus for school-age children\n• Sesame oil head massage weekly for strong hair and calm mind\n• Avoid cold drinks, ice cream — weakens child immunity\n• **Warm golden milk** at bedtime — deep sleep and brain development\n• Tulsi drops in honey — natural cold/cough remedy for kids\n• Keep daily routine consistent — sleep, meals, play, study" },
    { keywords: ['eye', 'eyes', 'vision', 'eyesight', 'dry eyes', 'eye strain'], answer: "👁️ **Ayurvedic Eye Care:**\n\n• **Triphala eyewash** — dissolve 1/2 tsp in boiled cooled water; wash eyes\n• **Rose water** drops — soothes redness and irritation naturally\n• **Netra Tarpana** — ghee pool treatment for dry eyes (done by practitioner)\n• **Amla juice** — richest source of Vit C; boosts eye health\n• Eat carrots, sweet potatoes, spinach, bilberry\n• Look at green trees and open sky for 5 min daily\n• Follow **20-20-20 rule** — every 20 min, look 20 feet away for 20 seconds\n• Avoid excessive screen time; use warm compress on tired eyes" },
    { keywords: ['dinacharya', 'routine', 'daily routine', 'morning routine', 'racha'], answer: "🌅 **Ideal Ayurvedic Daily Routine (Dinacharya):**\n\n**5:30 AM** — Wake up before sunrise (Brahma Muhurta)\n**5:45 AM** — Oil pulling with sesame/coconut oil (10 min)\n**6:00 AM** — Tongue scraping + warm lemon water\n**6:15 AM** — Abhyanga (warm oil self-massage, 10 min)\n**6:30 AM** — Yoga asanas (20-30 min)\n**7:00 AM** — Pranayama + Meditation (15 min)\n**7:30 AM** — Light breakfast\n**12:30 PM** — Main meal (lunch — heaviest meal)\n**6:30 PM** — Light dinner\n**9:00 PM** — Warm spiced milk\n**10:00 PM** — Sleep" },
    { keywords: ['herb', 'herbs', 'remedy', 'remedies', 'natural', 'ayurvedic medicine'], answer: "🌿 **Key Ayurvedic Herbs Quick Reference:**\n\n| Herb | Primary Use |\n|---|---|\n| **Ashwagandha** | Stress, energy, immunity |\n| **Brahmi** | Memory, anxiety, focus |\n| **Triphala** | Digestion, detox, anti-aging |\n| **Tulsi** | Cold, cough, immunity |\n| **Shatavari** | Women's health, hormones |\n| **Guduchi (Giloy)** | Fever, immunity, liver |\n| **Guggul** | Cholesterol, joints, thyroid |\n| **Shallaki** | Arthritis, joint pain |\n| **Neem** | Skin, blood purifier |\n| **Amla (Amalaki)** | Vitamin C, hair, anti-aging |\n\n⚠️ Always consult a qualified Ayurvedic practitioner before starting herbs." },
    { keywords: ['hello', 'hi', 'hey', 'namaste', 'greet', 'help', 'what can you do'], answer: "🙏 **Namaste! I'm your Ayurvedic AI Health Assistant.**\n\nI can answer questions about:\n\n🫁 **Doshas** — Vata, Pitta, Kapha\n🍽️ **Diet & Nutrition** — food for your type\n🌿 **Herbs & Remedies** — natural treatments\n🧘 **Yoga & Pranayama** — dosha-specific practices\n💊 **Health Conditions** — BP, diabetes, joints, skin, hair, digestion, sleep, stress, immunity, liver, kidneys, eyes, memory, hormones\n🌅 **Daily Routine** — Dinacharya & seasonal tips\n🔥 **Detox & Fasting** — Panchakarma, Triphala\n\nJust type your question or symptom and I'll help!" },
];

function getAyurvedicResponse(message) {
    const lowerMsg = message.toLowerCase();
    const matches = ayurvedicKnowledge.filter(k => k.keywords.some(kw => lowerMsg.includes(kw)));
    if (matches.length > 0) {
        const scored = matches.map(m => ({ ...m, score: m.keywords.filter(kw => lowerMsg.includes(kw)).length }));
        console.log(`[CHAT] Keywords matched: ${matches.map(m => m.keywords[0]).join(', ')}`);
        scored.sort((a, b) => b.score - a.score);
        return scored[0].answer;
    }
    return "🌿 I can help you with Doshas, Diet, Yoga, Herbs, Digestion, Sleep, and Stress management. Try asking about any of these topics!";
}

app.post('/functions/v1/ayurvedic-chatbot', (req, res) => {
    const { message } = req.body;
    console.log(`[CHAT] Query: "${message}"`);
    if (!message) return res.json({ message: "Please ask me a question about Ayurveda, health, diet, or wellness!" });
    const response = getAyurvedicResponse(message);
    res.json({ message: response });
});

// --- Frontend Static Files ---
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
        if (req.method !== 'GET') return next();
        const isExcluded = req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.startsWith('/functions/') || req.path.startsWith('/uploads/');
        if (isExcluded) return next();
        res.sendFile(path.join(distDir, 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Ayurveda backend running at http://localhost:${PORT}`);
    console.log(`📊 Login logs API: GET http://localhost:${PORT}/api/login-logs`);
});
