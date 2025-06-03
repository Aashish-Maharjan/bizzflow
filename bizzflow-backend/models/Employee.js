const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    joiningDate: {
        type: Date,
        required: true
    },
    salary: {
        basic: {
            type: Number,
            required: true
        },
        allowances: {
            type: Number,
            default: 0
        },
        deductions: {
            type: Number,
            default: 0
        }
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        branchName: String,
        ifscCode: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'terminated', 'on_leave'],
        default: 'active'
    },
    documents: [{
        type: {
            type: String,
            required: true
        },
        name: String,
        url: String,
        uploadDate: Date
    }],
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        address: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
employeeSchema.index({ employeeId: 1, email: 1 });
employeeSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Employee', employeeSchema); 