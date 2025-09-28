import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import path from 'path';
import { fileURLToPath } from 'url';
import users from './data/users.js';
import products from './data/products.js';
import banners from './data/banners.js';
import categories from './data/categories.js';
import brands from './data/brands.js';
import healthConditions from './data/healthConditions.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import Banner from './models/bannerModel.js';
import Category from './models/categoryModel.js';
import Brand from './models/brandModel.js';
import HealthCondition from './models/healthConditionModel.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Banner.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await HealthCondition.deleteMany();

    // Create users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Create categories first
    const createdCategories = await Category.insertMany(categories);

    // Create brands first
    const createdBrands = await Brand.insertMany(brands);

    // Create a mapping of category names to ObjectIds
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Create products with proper category references and real brands
    const realBrands = [
      'Square Pharma',
      'Beximco Pharma',
      'Incepta Pharma',
      'Renata Limited',
      'Opsonin Pharma',
      'Healthcare Pharma',
    ];

    const sampleProducts = products.map((product) => {
      // Map string category to ObjectId if it exists, otherwise use first category
      const categoryId =
        categoryMap[product.category] || createdCategories[0]._id;

      // Assign a random brand from our real brands list
      const randomBrand =
        realBrands[Math.floor(Math.random() * realBrands.length)];

      return {
        ...product,
        user: adminUser,
        category: categoryId, // Use ObjectId instead of string
        brand: randomBrand, // Use real brand names instead of fake ones
        // Add some sample flags for different sections
        isFeatured: Math.random() > 0.7,
        isFlashSale: Math.random() > 0.8,
        isBestSeller: Math.random() > 0.6,
        discount: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 5 : 0,
      };
    });
    await Product.insertMany(sampleProducts);

    // Create banners
    await Banner.insertMany(banners);

    // Create health conditions
    const createdHealthConditions = await HealthCondition.insertMany(
      healthConditions
    );

    // Create a mapping of health condition names to ObjectIds
    const conditionMap = {};
    createdHealthConditions.forEach((condition) => {
      conditionMap[condition.name] = condition._id;
    });

    // Update products with health conditions based on product names and categories
    const productUpdates = await Product.find();

    for (let product of productUpdates) {
      const healthConditionIds = [];
      const productName = product.name.toLowerCase();
      const productDescription = (product.description || '').toLowerCase();

      // Assign health conditions based on product name and description
      if (
        productName.includes('fever') ||
        productName.includes('pain') ||
        productName.includes('headache') ||
        productName.includes('paracetamol') ||
        productName.includes('ibuprofen') ||
        productName.includes('aspirin')
      ) {
        healthConditionIds.push(conditionMap['Fever & Pain']);
      }

      if (
        productName.includes('cold') ||
        productName.includes('cough') ||
        productName.includes('flu') ||
        productDescription.includes('respiratory')
      ) {
        healthConditionIds.push(conditionMap['Cold & Cough']);
      }

      if (
        productName.includes('digestive') ||
        productName.includes('stomach') ||
        productName.includes('antacid') ||
        productDescription.includes('digestion') ||
        productName.includes('gaviscon') ||
        productName.includes('omeprazole')
      ) {
        healthConditionIds.push(conditionMap['Stomach Care']);
      }

      if (
        productName.includes('skin') ||
        productDescription.includes('dermatitis') ||
        productDescription.includes('eczema') ||
        productName.includes('cream') ||
        productName.includes('lotion')
      ) {
        healthConditionIds.push(conditionMap['Skin Care']);
      }

      if (
        productName.includes('eye') ||
        productDescription.includes('vision') ||
        productName.includes('drops')
      ) {
        healthConditionIds.push(conditionMap['Eye Care']);
      }

      if (
        productName.includes('women') ||
        productDescription.includes('feminine') ||
        productName.includes('contraceptive') ||
        productDescription.includes('pregnancy')
      ) {
        healthConditionIds.push(conditionMap['Women Care']);
      }

      // Filter out undefined values and update the product
      const validConditionIds = healthConditionIds.filter((id) => id);
      if (validConditionIds.length > 0) {
        await Product.findByIdAndUpdate(product._id, {
          healthConditions: validConditionIds,
        });
      }
    }

    console.log('Data Imported!'.green.inverse);
    console.log('Imported:');
    console.log(`- ${users.length} Users`);
    console.log(`- ${products.length} Products`);
    console.log(`- ${banners.length} Banners`);
    console.log(`- ${categories.length} Categories`);
    console.log(`- ${brands.length} Brands`);
    console.log(`- ${healthConditions.length} Health Conditions`);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Banner.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await HealthCondition.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
