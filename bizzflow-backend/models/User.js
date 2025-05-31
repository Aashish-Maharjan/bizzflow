const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee', 'manager'],
    default: 'employee'
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  basicSalary: {
    type: Number,
    required: true,
    default: 0
  },
  employmentDetails: {
    joinDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      default: 'full-time'
    },
    designation: {
      type: String,
      required: true,
      trim: true
    },
    probationPeriod: {
      type: Number,
      default: 3
    },
    workLocation: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office'
    },
    reportingTo: {
      type: String,
      trim: true
    },
    workHours: {
      type: String,
      default: '40'
    },
    shiftType: {
      type: String,
      enum: ['day', 'night', 'flexible'],
      default: 'day'
    }
  },
  personalDetails: {
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    nationality: {
      type: String,
      trim: true
    },
    address: {
      street: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        trim: true
      },
      postalCode: {
        type: String,
        trim: true
      }
    }
  },
  educationDetails: {
    highestQualification: {
      type: String,
      trim: true
    },
    fieldOfStudy: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true
    },
    yearOfCompletion: {
      type: Number
    }
  },
  bankDetails: {
    accountName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    branch: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings'
    }
  },
  documents: {
    idProof: {
      type: String
    },
    addressProof: {
      type: String
    },
    resume: {
      type: String
    },
    offerLetter: {
      type: String
    },
    photo: {
      type: String
    }
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 