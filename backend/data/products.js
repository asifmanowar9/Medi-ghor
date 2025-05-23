// Sample medicine and healthcare products data
// This follows your productModel.js schema structure
// All ObjectIds are now valid 24-character hexadecimal strings

const medicineProducts = [
  {
    user: '507f1f77bcf86cd799439011', // Sample ObjectId for admin user
    name: 'Paracetamol 500mg Tablets',
    image: '/images/paracetamol-500mg.jpg',
    brand: 'PharmaCorp',
    category: 'Pain Relief',
    description:
      'Effective pain relief and fever reducer. Contains 500mg paracetamol per tablet. Suitable for adults and children over 12 years. Provides fast-acting relief from headaches, muscle aches, and fever.',
    reviews: [
      {
        name: 'Sarah Johnson',
        rating: 5,
        comment:
          'Very effective for headaches. Works quickly and no side effects.',
        user: '507f1f77bcf86cd799439012',
      },
      {
        name: 'Mike Chen',
        rating: 4,
        comment: 'Good product, affordable price. Always keep some at home.',
        user: '507f1f77bcf86cd799439013',
      },
    ],
    rating: 4.5,
    numReviews: 2,
    price: 8.99,
    countInStock: 150,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Ibuprofen 400mg Tablets',
    image: '/images/ibuprofen-400mg.jpg',
    brand: 'MediHealth',
    category: 'Pain Relief',
    description:
      'Anti-inflammatory pain relief tablets. Each tablet contains 400mg ibuprofen. Effective for reducing inflammation, pain, and fever. Suitable for arthritis, muscle strains, and general pain relief.',
    reviews: [
      {
        name: 'Emma Wilson',
        rating: 5,
        comment:
          "Excellent for joint pain. Much better than other brands I've tried.",
        user: '507f1f77bcf86cd799439014',
      },
    ],
    rating: 5.0,
    numReviews: 1,
    price: 12.5,
    countInStock: 200,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Omeprazole 20mg Capsules',
    image: '/images/omeprazole-20mg.jpg',
    brand: 'GastroMed',
    category: 'Digestive Health',
    description:
      'Proton pump inhibitor for treating acid reflux and heartburn. 20mg omeprazole capsules provide 24-hour relief from stomach acid. Suitable for GERD treatment and peptic ulcer prevention.',
    reviews: [
      {
        name: 'Robert Davis',
        rating: 4,
        comment:
          "Really helps with my acid reflux. Take one in the morning and I'm good all day.",
        user: '507f1f77bcf86cd799439015',
      },
      {
        name: 'Lisa Martinez',
        rating: 5,
        comment: 'Life saver for my GERD. No more heartburn after meals.',
        user: '507f1f77bcf86cd799439016',
      },
    ],
    rating: 4.5,
    numReviews: 2,
    price: 18.75,
    countInStock: 80,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Cetirizine 10mg Antihistamine Tablets',
    image: '/images/cetirizine-10mg.jpg',
    brand: 'AllergyFree',
    category: 'Allergy Relief',
    description:
      'Non-drowsy antihistamine tablets for hay fever and allergic reactions. Each tablet contains 10mg cetirizine hydrochloride. Provides 24-hour relief from sneezing, runny nose, and itchy eyes.',
    reviews: [
      {
        name: 'Amanda Taylor',
        rating: 5,
        comment:
          'Perfect for my seasonal allergies. Non-drowsy formula works great.',
        user: '507f1f77bcf86cd799439017',
      },
    ],
    rating: 5.0,
    numReviews: 1,
    price: 14.25,
    countInStock: 120,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Multivitamin Daily Supplement',
    image: '/images/multivitamin-daily.jpg',
    brand: 'VitaLife',
    category: 'Vitamins & Supplements',
    description:
      'Complete daily multivitamin with essential vitamins and minerals. Contains Vitamin A, B-complex, C, D, E, plus iron, calcium, and zinc. Supports immune system and overall health.',
    reviews: [
      {
        name: 'David Lee',
        rating: 4,
        comment:
          'Good quality vitamins. I feel more energetic since taking these daily.',
        user: '507f1f77bcf86cd799439018',
      },
      {
        name: 'Jennifer Brown',
        rating: 4,
        comment: 'Easy to swallow, no aftertaste. Good value for money.',
        user: '507f1f77bcf86cd799439019',
      },
    ],
    rating: 4.0,
    numReviews: 2,
    price: 22.99,
    countInStock: 300,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Digital Blood Pressure Monitor',
    image: '/images/bp-monitor-digital.jpg',
    brand: 'HealthTech',
    category: 'Medical Devices',
    description:
      'Automatic digital blood pressure monitor with large LCD display. Memory storage for 60 readings. Includes adult cuff (22-42cm). WHO indicator shows if readings are in normal range.',
    reviews: [
      {
        name: 'Margaret Smith',
        rating: 5,
        comment:
          "Very accurate readings compared to my doctor's equipment. Easy to use.",
        user: '507f1f77bcf86cd79943901a',
      },
      {
        name: 'James Wilson',
        rating: 4,
        comment:
          'Good device for home monitoring. Large display is easy to read.',
        user: '507f1f77bcf86cd79943901b',
      },
    ],
    rating: 4.5,
    numReviews: 2,
    price: 45.99,
    countInStock: 50,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Thermometer Digital Rapid',
    image: '/images/thermometer-digital.jpg',
    brand: 'MedTemp',
    category: 'Medical Devices',
    description:
      'Fast and accurate digital thermometer with flexible tip. 10-second reading time. Fever alarm and memory recall. Waterproof design with protective case included.',
    reviews: [
      {
        name: 'Patricia Garcia',
        rating: 5,
        comment:
          "Super fast and accurate. Great for checking kids' temperature quickly.",
        user: '507f1f77bcf86cd79943901c',
      },
    ],
    rating: 5.0,
    numReviews: 1,
    price: 12.99,
    countInStock: 75,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Antiseptic Hand Sanitizer 500ml',
    image: '/images/hand-sanitizer-500ml.jpg',
    brand: 'CleanHands',
    category: 'First Aid',
    description:
      '70% alcohol-based hand sanitizer gel. Kills 99.9% of germs and bacteria. Moisturizing formula with aloe vera. Large 500ml pump bottle ideal for home or office use.',
    reviews: [
      {
        name: 'Steven Anderson',
        rating: 4,
        comment: "Good quality sanitizer. Doesn't dry out hands too much.",
        user: '507f1f77bcf86cd79943901d',
      },
      {
        name: 'Carol Thompson',
        rating: 5,
        comment: 'Perfect for our office. Pump dispenser is very convenient.',
        user: '507f1f77bcf86cd79943901e',
      },
    ],
    rating: 4.5,
    numReviews: 2,
    price: 9.99,
    countInStock: 200,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Calcium + Vitamin D3 Tablets',
    image: '/images/calcium-vitamin-d3.jpg',
    brand: 'BoneStrong',
    category: 'Vitamins & Supplements',
    description:
      'Calcium carbonate 600mg with Vitamin D3 400IU per tablet. Supports bone health and calcium absorption. Essential for maintaining strong bones and teeth. Suitable for adults and elderly.',
    reviews: [
      {
        name: 'Dorothy Miller',
        rating: 4,
        comment:
          'Doctor recommended these for my osteoporosis. Easy to take daily.',
        user: '507f1f77bcf86cd79943901f',
      },
    ],
    rating: 4.0,
    numReviews: 1,
    price: 16.5,
    countInStock: 180,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Cough Syrup Cherry Flavor 200ml',
    image: '/images/cough-syrup-cherry.jpg',
    brand: 'CoughCare',
    category: 'Cough & Cold',
    description:
      'Dextromethorphan-based cough suppressant syrup. Cherry flavored for pleasant taste. Provides relief from dry, irritating coughs. Suitable for adults and children over 6 years.',
    reviews: [
      {
        name: 'Michelle Rodriguez',
        rating: 5,
        comment:
          "Really effective for persistent cough. Kids don't mind the cherry taste.",
        user: '507f1f77bcf86cd799439020',
      },
      {
        name: 'Kevin White',
        rating: 4,
        comment:
          'Works well for nighttime cough relief. Helps me sleep better.',
        user: '507f1f77bcf86cd799439021',
      },
    ],
    rating: 4.5,
    numReviews: 2,
    price: 11.75,
    countInStock: 95,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Hydrocortisone Cream 1% - 30g',
    image: '/images/hydrocortisone-cream.jpg',
    brand: 'SkinRelief',
    category: 'Skin Care',
    description:
      'Topical corticosteroid cream for treating eczema, dermatitis, and insect bites. Contains 1% hydrocortisone acetate. Reduces inflammation, itching, and redness. 30g tube.',
    reviews: [
      {
        name: 'Barbara Lewis',
        rating: 5,
        comment: 'Great for my eczema flare-ups. Reduces itching within hours.',
        user: '507f1f77bcf86cd799439022',
      },
    ],
    rating: 5.0,
    numReviews: 1,
    price: 8.25,
    countInStock: 110,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Probiotic Capsules 30 Billion CFU',
    image: '/images/probiotic-capsules.jpg',
    brand: 'GutHealth',
    category: 'Digestive Health',
    description:
      'High-potency probiotic supplement with 30 billion CFU. Contains 12 strains of beneficial bacteria. Supports digestive health and immune system. Delayed-release capsules for maximum effectiveness.',
    reviews: [
      {
        name: 'Thomas Clark',
        rating: 4,
        comment:
          'Noticed improvement in digestion after 2 weeks. Good quality probiotics.',
        user: '507f1f77bcf86cd799439023',
      },
      {
        name: 'Helen Walker',
        rating: 5,
        comment:
          'Excellent for gut health. No more bloating issues since taking these.',
        user: '507f1f77bcf86cd799439024',
      },
    ],
    rating: 4.5,
    numReviews: 2,
    price: 28.99,
    countInStock: 85,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'First Aid Kit Complete - 100 Pieces',
    image: '/images/first-aid-kit-complete.jpg',
    brand: 'SafetyFirst',
    category: 'First Aid',
    description:
      'Comprehensive first aid kit with 100 essential items. Includes bandages, antiseptic wipes, gauze pads, medical tape, scissors, and instruction booklet. Compact waterproof case.',
    reviews: [
      {
        name: 'Richard Hall',
        rating: 5,
        comment:
          'Complete kit with everything you need. Great for home and car.',
        user: '507f1f77bcf86cd799439025',
      },
      {
        name: 'Nancy Young',
        rating: 4,
        comment:
          'Well-organized kit. Good value for the number of items included.',
        user: '507f1f77bcf86cd799439026',
      },
    ],
    rating: 4.5,
    numReviews: 2,
    price: 35.99,
    countInStock: 40,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Glucose Test Strips - 50 Count',
    image: '/images/glucose-test-strips.jpg',
    brand: 'DiabCare',
    category: 'Diabetic Care',
    description:
      'Accurate glucose test strips compatible with most blood glucose meters. Pack of 50 strips with long expiry date. No coding required. Provides reliable blood sugar readings in 5 seconds.',
    reviews: [
      {
        name: 'George King',
        rating: 4,
        comment:
          'Accurate readings and good value. Compatible with my existing meter.',
        user: '507f1f77bcf86cd799439027',
      },
    ],
    rating: 4.0,
    numReviews: 1,
    price: 24.99,
    countInStock: 60,
  },
  {
    user: '507f1f77bcf86cd799439011',
    name: 'Omega-3 Fish Oil Capsules 1000mg',
    image: '/images/omega3-fish-oil.jpg',
    brand: 'OceanPure',
    category: 'Vitamins & Supplements',
    description:
      'High-quality fish oil capsules with 1000mg per serving. Contains EPA and DHA omega-3 fatty acids. Supports heart health, brain function, and joint mobility. Molecular distilled for purity.',
    reviews: [
      {
        name: 'Susan Allen',
        rating: 5,
        comment:
          'No fishy aftertaste. Good quality supplement for heart health.',
        user: '507f1f77bcf86cd799439028',
      },
      {
        name: 'Daniel Scott',
        rating: 4,
        comment: 'Doctor recommended these. Easy to swallow and good value.',
        user: '507f1f77bcf86cd799439029',
      },
    ],
    rating: 4.5,
    numReviews: 2,
    price: 19.99,
    countInStock: 150,
  },
];

// Export for use in your application
export default medicineProducts;

// Alternative: If you need it as a JSON file, here's the same data formatted for import
const medicineProductsJSON = JSON.stringify(medicineProducts, null, 2);

// Usage example for seeding database:
/*
import Product from './models/productModel.js';
import medicineProducts from './data/medicineProducts.js';

const seedProducts = async () => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(medicineProducts);
    console.log('Products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};
*/

// const products = [
//   {
//     name: 'Airpods Wireless Bluetooth Headphones',
//     image: '/images/airpods.jpg',
//     description:
//       'Bluetooth technology lets you connect it with compatible devices wirelessly High-quality AAC audio offers immersive listening experience Built-in microphone allows you to take calls while working',
//     brand: 'Apple',
//     category: 'Electronics',
//     price: 89.99,
//     countInStock: 10,
//     rating: 4.5,
//     numReviews: 12,
//   },
//   {
//     name: 'iPhone 11 Pro 256GB Memory',
//     image: '/images/phone.jpg',
//     description:
//       'Introducing the iPhone 11 Pro. A transformative triple-camera system that adds tons of capability without complexity. An unprecedented leap in battery life',
//     brand: 'Apple',
//     category: 'Electronics',
//     price: 599.99,
//     countInStock: 7,
//     rating: 4.0,
//     numReviews: 8,
//   },
//   {
//     name: 'Cannon EOS 80D DSLR Camera',
//     image: '/images/camera.jpg',
//     description:
//       'Characterized by versatile imaging specs, the Canon EOS 80D further clarifies itself using a pair of robust focusing systems and an intuitive design',
//     brand: 'Cannon',
//     category: 'Electronics',
//     price: 929.99,
//     countInStock: 5,
//     rating: 3,
//     numReviews: 12,
//   },
//   {
//     name: 'Sony Playstation 4 Pro White Version',
//     image: '/images/playstation.jpg',
//     description:
//       'The ultimate home entertainment center starts with PlayStation. Whether you are into gaming, HD movies, television, music',
//     brand: 'Sony',
//     category: 'Electronics',
//     price: 399.99,
//     countInStock: 11,
//     rating: 5,
//     numReviews: 12,
//   },
//   {
//     name: 'Logitech G-Series Gaming Mouse',
//     image: '/images/mouse.jpg',
//     description:
//       'Get a better handle on your games with this Logitech LIGHTSYNC gaming mouse. The six programmable buttons allow customization for a smooth playing experience',
//     brand: 'Logitech',
//     category: 'Electronics',
//     price: 49.99,
//     countInStock: 7,
//     rating: 3.5,
//     numReviews: 10,
//   },
//   {
//     name: 'Amazon Echo Dot 3rd Generation',
//     image: '/images/alexa.jpg',
//     description:
//       'Meet Echo Dot - Our most popular smart speaker with a fabric design. It is our most compact smart speaker that fits perfectly into small space',
//     brand: 'Amazon',
//     category: 'Electronics',
//     price: 29.99,
//     countInStock: 0,
//     rating: 4,
//     numReviews: 12,
//   },
// ];

// export default products;
