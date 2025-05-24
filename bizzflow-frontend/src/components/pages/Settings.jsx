import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import Card from '../ui/Card';
import Switch from '../ui/Switch';
import Label from '../ui/Label';

export default function Settings() {
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgPAN, setOrgPAN] = useState('');

  const [categories, setCategories] = useState([{ name: '', description: '' }]);
  const [esewaEnabled, setEsewaEnabled] = useState(false);
  const [khaltiEnabled, setKhaltiEnabled] = useState(false);
  const [irdConnected, setIrdConnected] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  const handleAddCategory = () =>
    setCategories([...categories, { name: '', description: '' }]);

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  const handleRemoveCategory = (index) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-8">Settings</h1>
      
      <div className="grid gap-8">
        {/* Organization Profile */}
        <Card className="p-6 bg-card dark:bg-gray-800/40 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">Organization Profile</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-primary/90 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Save Changes
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground dark:text-gray-100">Organization Name</Label>
              <Input
                placeholder="e.g. BizFlow Nepal"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground dark:text-gray-100">Organization Type</Label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full bg-background dark:bg-gray-700 text-foreground dark:text-gray-100 border border-input dark:border-gray-600 rounded-md h-10 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:placeholder-gray-400"
              >
                <option value="">Select Type</option>
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="Non-Profit">Non-Profit</option>
                <option value="Government">Government</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground dark:text-gray-100">Email</Label>
              <Input
                type="email"
                placeholder="e.g. info@bizflow.com"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground dark:text-gray-100">Contact Number</Label>
              <Input
                type="tel"
                placeholder="e.g. 9800000000"
                value={orgPhone}
                onChange={(e) => setOrgPhone(e.target.value)}
                className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground dark:text-gray-100">Address</Label>
              <Input
                placeholder="e.g. Kathmandu, Nepal"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground dark:text-gray-100">PAN Number</Label>
              <Input
                placeholder="e.g. 123456789"
                value={orgPAN}
                onChange={(e) => setOrgPAN(e.target.value)}
                className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* Custom Task Categories */}
        <Card className="p-6 bg-card dark:bg-gray-800/40 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">Custom Task Categories</h2>
            <Button 
              onClick={handleAddCategory}
              variant="outline"
              size="sm"
              className="hover:bg-primary/90 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Add Category
            </Button>
          </div>

          <div className="space-y-4">
            {categories.map((cat, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg border border-border dark:border-gray-600 bg-card dark:bg-gray-700/50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Category {index + 1}</Label>
                  {categories.length > 1 && (
                    <Button
                      onClick={() => handleRemoveCategory(index)}
                      variant="destructive"
                      size="sm"
                      className="h-8 dark:text-white"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Category Name"
                      value={cat.name}
                      onChange={(e) =>
                        handleCategoryChange(index, 'name', e.target.value)
                      }
                      className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Short description (optional)"
                      value={cat.description}
                      onChange={(e) =>
                        handleCategoryChange(index, 'description', e.target.value)
                      }
                      className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Digital Wallet Integration */}
        <Card className="p-6 bg-card dark:bg-gray-800/40 shadow-lg">
          <h2 className="text-xl font-semibold text-foreground dark:text-white mb-6">Digital Wallet Integration</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground dark:text-gray-100">Enable eSewa</Label>
                <p className="text-sm text-muted-foreground dark:text-gray-300">Accept payments through eSewa digital wallet</p>
              </div>
              <Switch checked={esewaEnabled} onCheckedChange={setEsewaEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground dark:text-gray-100">Enable Khalti</Label>
                <p className="text-sm text-muted-foreground dark:text-gray-300">Accept payments through Khalti digital wallet</p>
              </div>
              <Switch checked={khaltiEnabled} onCheckedChange={setKhaltiEnabled} />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 bg-card dark:bg-gray-800/40 shadow-lg">
          <h2 className="text-xl font-semibold text-foreground dark:text-white mb-6">Notification Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground dark:text-gray-100">Email Notifications</Label>
                <p className="text-sm text-muted-foreground dark:text-gray-300">Receive updates and alerts via email</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground dark:text-gray-100">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground dark:text-gray-300">Receive updates and alerts via SMS</p>
              </div>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
