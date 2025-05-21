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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Organization Profile */}
      <Card>
        <h2 className="text-white text-lg font-semibold mb-4">Organization Profile</h2>
        <div className="space-y-4">
          <div>
            <Label>Organization Name</Label>
            <Input
              placeholder="e.g. BizFlow Nepal"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div>
            <Label>Organization Type</Label>
            <select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">Select Type</option>
              <option value="Private">Private</option>
              <option value="Public">Public</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Government">Government</option>
            </select>
          </div>
          <div>
            <Label>Email</Label>
            <Input
              placeholder="e.g. info@bizflow.com"
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>Contact Number</Label>
            <Input
              placeholder="e.g. 9800000000"
              value={orgPhone}
              onChange={(e) => setOrgPhone(e.target.value)}
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              placeholder="e.g. Kathmandu, Nepal"
              value={orgAddress}
              onChange={(e) => setOrgAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>PAN Number</Label>
            <Input
              placeholder="e.g. 123456789"
              value={orgPAN}
              onChange={(e) => setOrgPAN(e.target.value)}
            />
          </div>
          <Button>Save Profile</Button>
        </div>
      </Card>

      {/* Custom Task Categories */}
      <Card>
        <h2 className="text-white text-lg font-semibold mb-4">Custom Task Categories</h2>
        <div className="space-y-4">
          {categories.map((cat, index) => (
            <div key={index} className="space-y-2 border rounded p-4 relative">
              <div className="flex justify-between items-center">
                <Label>Category Name</Label>
                {categories.length > 1 && (
                  <button
                    onClick={() => handleRemoveCategory(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <Input
                placeholder={`Category ${index + 1}`}
                value={cat.name}
                onChange={(e) =>
                  handleCategoryChange(index, 'name', e.target.value)
                }
              />
              <Label>Description (optional)</Label>
              <Input
                placeholder="Short description"
                value={cat.description}
                onChange={(e) =>
                  handleCategoryChange(index, 'description', e.target.value)
                }
              />
            </div>
          ))}
          <Button onClick={handleAddCategory}>Add Category</Button>
        </div>
      </Card>

      {/* Wallet Integration */}
      <Card>
        <h2 className="text-white text-lg font-semibold mb-4">Digital Wallet Integration</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable eSewa</Label>
            <Switch checked={esewaEnabled} onCheckedChange={setEsewaEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enable Khalti</Label>
            <Switch checked={khaltiEnabled} onCheckedChange={setKhaltiEnabled} />
          </div>
        </div>
      </Card>

      {/* IRD Integration */}
      <Card>
        <h2 className="text-white text-lg font-semibold mb-4">IRD PAN/Tax Integration</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Connect to IRD Nepal</Label>
            <Button onClick={() => setIrdConnected(!irdConnected)}>
              {irdConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-white text-lg font-semibold mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between">
            <Label>SMS Notifications</Label>
            <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
          </div>
        </div>
      </Card>
    </div>
  );
}
