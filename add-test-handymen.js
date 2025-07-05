const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const handymanSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  profession: String,
  location: String,
  hourlyRate: Number,
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  bio: String,
  skills: [String],
  experience: String,
  profileImage: String,
  portfolio: [String],
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Handyman = mongoose.model('Handyman', handymanSchema);

const testHandymen = [
  {
    firstName: 'Saidou',
    lastName: 'Jallow',
    email: 'saidou@example.com',
    phone: '+220123456789',
    password: '$2b$10$examplehash', // This would be hashed in real app
    profession: 'Plumber',
    location: 'Serrekunda',
    hourlyRate: 25,
    rating: 4.5,
    ratingCount: 45,
    bio: 'Experienced plumber with 5 years of experience in residential and commercial plumbing.',
    skills: ['Pipe Installation', 'Leak Repair', 'Drain Cleaning', 'Water Heater Installation'],
    experience: '5 years',
    profileImage: 'public/images/handyman-profiles/profile1.jpeg',
    portfolio: ['public/images/plumber.jpg', 'public/images/light-fixture.jpg']
  },
  {
    firstName: 'Abdou',
    lastName: 'Mansaray',
    email: 'abdou@example.com',
    phone: '+220123456790',
    password: '$2b$10$examplehash',
    profession: 'Gardener',
    location: 'Kanifing',
    hourlyRate: 20,
    rating: 5.0,
    ratingCount: 50,
    bio: 'Professional gardener specializing in landscape design and maintenance.',
    skills: ['Landscaping', 'Garden Maintenance', 'Plant Care', 'Irrigation Systems'],
    experience: '3 years',
    profileImage: 'public/images/handyman-profiles/profile2.jpeg',
    portfolio: ['public/images/gardening.jpg']
  },
  {
    firstName: 'Isatou',
    lastName: 'Camara',
    email: 'isatou@example.com',
    phone: '+220123456791',
    password: '$2b$10$examplehash',
    profession: 'Cleaner',
    location: 'Bakau',
    hourlyRate: 15,
    rating: 4.0,
    ratingCount: 91,
    bio: 'Professional cleaning services for homes and offices.',
    skills: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Window Cleaning'],
    experience: '4 years',
    profileImage: 'public/images/handyman-profiles/profile3.jpeg',
    portfolio: ['public/images/cleaning-image.jpg']
  },
  {
    firstName: 'Mamadou',
    lastName: 'Bah',
    email: 'mamadou@example.com',
    phone: '+220123456792',
    password: '$2b$10$examplehash',
    profession: 'Plumber',
    location: 'Jeshwang',
    hourlyRate: 30,
    rating: 4.5,
    ratingCount: 89,
    bio: 'Licensed plumber with expertise in modern plumbing systems.',
    skills: ['Plumbing Repair', 'Installation', 'Emergency Services', 'System Maintenance'],
    experience: '7 years',
    profileImage: 'public/images/handyman-profiles/profile4.jpeg',
    portfolio: ['public/images/plumber.jpg', 'public/images/bathroom-remodeling.jpeg']
  },
  {
    firstName: 'Charles',
    lastName: 'Lowe',
    email: 'charles@example.com',
    phone: '+220123456793',
    password: '$2b$10$examplehash',
    profession: 'Block Work',
    location: 'Jeshwang',
    hourlyRate: 35,
    rating: 4.5,
    ratingCount: 15,
    bio: 'Skilled block worker specializing in construction and masonry.',
    skills: ['Block Laying', 'Masonry', 'Construction', 'Foundation Work'],
    experience: '6 years',
    profileImage: 'public/images/handyman-profiles/profile5.jpeg',
    portfolio: ['public/images/kitchen-remodeling.jpeg']
  },
  {
    firstName: 'Mariam',
    lastName: 'Sanneh',
    email: 'mariam@example.com',
    phone: '+220123456794',
    password: '$2b$10$examplehash',
    profession: 'Painter',
    location: 'Lamin',
    hourlyRate: 22,
    rating: 4.5,
    ratingCount: 25,
    bio: 'Professional painter with expertise in interior and exterior painting.',
    skills: ['Interior Painting', 'Exterior Painting', 'Color Consultation', 'Surface Preparation'],
    experience: '4 years',
    profileImage: 'public/images/handyman-profiles/profile6.jpeg',
    portfolio: ['public/images/painting.jpg']
  }
];

async function addTestHandymen() {
  try {
    // Clear existing handymen
    await Handyman.deleteMany({});
    console.log('✅ Cleared existing handymen');
    
    // Add test handymen
    const result = await Handyman.insertMany(testHandymen);
    console.log(`✅ Added ${result.length} test handymen to database`);
    
    // Display added handymen
    result.forEach(handyman => {
      console.log(`- ${handyman.firstName} ${handyman.lastName} (${handyman.profession})`);
    });
    
    console.log('\n🎉 Test handymen added successfully!');
    console.log('You can now test the homepage with real data.');
    
  } catch (error) {
    console.error('❌ Error adding test handymen:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestHandymen(); 