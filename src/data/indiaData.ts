// Indian States and Cities Data
export const INDIAN_STATES_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada', 'Rajahmundry'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Anand'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Ratlam'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Chandigarh'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Noida', 'Greater Noida'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Rishikesh'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  'Ladakh': ['Leh', 'Kargil'],
  'Lakshadweep': ['Kavaratti'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
};

// Common amenities for properties
export const PROPERTY_AMENITIES = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'parking', label: 'Parking' },
  { id: 'security', label: '24/7 Security' },
  { id: 'cctv', label: 'CCTV Surveillance' },
  { id: 'power_backup', label: 'Power Backup' },
  { id: 'water_supply', label: '24/7 Water Supply' },
  { id: 'lift', label: 'Lift/Elevator' },
  { id: 'gym', label: 'Gym' },
  { id: 'laundry', label: 'Laundry Service' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'meals', label: 'Meals Included' },
  { id: 'tv', label: 'TV' },
  { id: 'fridge', label: 'Refrigerator' },
  { id: 'washing_machine', label: 'Washing Machine' },
  { id: 'microwave', label: 'Microwave' },
  { id: 'geyser', label: 'Geyser/Water Heater' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'garden', label: 'Garden' },
  { id: 'play_area', label: 'Play Area' },
];

// Furnishing status options
export const FURNISHING_STATUS = [
  { value: 'fully_furnished', label: 'Fully Furnished' },
  { value: 'semi_furnished', label: 'Semi Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

// Preferred tenant types
export const TENANT_TYPES = [
  { value: 'any', label: 'Any' },
  { value: 'students', label: 'Students Only' },
  { value: 'working_professionals', label: 'Working Professionals Only' },
  { value: 'family', label: 'Family Only' },
  { value: 'bachelors', label: 'Bachelors Only' },
];

// Property age options
export const PROPERTY_AGE = [
  { value: '0-1', label: 'Less than 1 year' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: 'More than 10 years' },
];

// BHK types for flats/apartments
export const BHK_TYPES = [
  { value: '1RK', label: '1 RK (Room Kitchen)' },
  { value: '1BHK', label: '1 BHK' },
  { value: '2BHK', label: '2 BHK' },
  { value: '3BHK', label: '3 BHK' },
  { value: '4BHK', label: '4 BHK' },
  { value: '5BHK', label: '5+ BHK' },
];

// Sharing types for PG/Hostel
export const SHARING_TYPES = [
  { value: 'single', label: 'Single Occupancy' },
  { value: 'double', label: 'Double Sharing' },
  { value: 'triple', label: 'Triple Sharing' },
  { value: 'quad', label: 'Quad Sharing (4 people)' },
  { value: 'dormitory', label: 'Dormitory (5+ people)' },
];

// Meal plans for mess
export const MEAL_PLANS = [
  { value: 'breakfast', label: 'Breakfast Only' },
  { value: 'lunch', label: 'Lunch Only' },
  { value: 'dinner', label: 'Dinner Only' },
  { value: 'breakfast_dinner', label: 'Breakfast + Dinner' },
  { value: 'lunch_dinner', label: 'Lunch + Dinner' },
  { value: 'all_meals', label: 'All Meals (Breakfast + Lunch + Dinner)' },
  { value: 'custom', label: 'Custom Meal Plan' },
];

// Room-specific amenities
export const ROOM_AMENITIES = [
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'tv', label: 'TV' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'attached_bathroom', label: 'Attached Bathroom' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'wardrobe', label: 'Wardrobe' },
  { id: 'study_table', label: 'Study Table' },
  { id: 'chair', label: 'Chair' },
  { id: 'bed', label: 'Bed' },
  { id: 'mattress', label: 'Mattress' },
  { id: 'fan', label: 'Fan' },
  { id: 'light', label: 'Light' },
  { id: 'window', label: 'Window' },
  { id: 'geyser', label: 'Geyser' },
  { id: 'fridge', label: 'Mini Fridge' },
];
