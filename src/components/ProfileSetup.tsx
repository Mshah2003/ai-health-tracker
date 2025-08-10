import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Calendar, Users } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
  initialProfile?: UserProfile;
  isUpdate?: boolean;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, onSkip, initialProfile, isUpdate = false }) => {
  const [age, setAge] = useState(initialProfile?.age?.toString() || '');
  const [gender, setGender] = useState<UserProfile['gender']>(initialProfile?.gender || undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      age: age ? parseInt(age) : undefined,
      gender,
      conditions: initialProfile?.conditions || []
    });
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete({
        conditions: initialProfile?.conditions || []
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isUpdate ? 'Update Profile' : 'Welcome to HealthTracker AI'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Help us customize your health tracking experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Age
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="Enter your age"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Gender
            </label>
            <select
              value={gender || ''}
              required
              onChange={(e) => setGender(e.target.value as UserProfile['gender'] || undefined)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-teal-600 hover:to-purple-600 focus:ring-4 focus:ring-teal-200 dark:focus:ring-teal-800 transition-all duration-200 font-medium"
          >
            {isUpdate ? 'Update Profile' : 'Continue'}
          </button>

          {/* {!isUpdate && (
            <button
              type="button"
              onClick={handleSkip}
              className="w-full mt-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all duration-200 font-medium"
            >
              Skip for now
            </button>
          )} */}
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          This information helps provide personalized health insights. You can update this anytime.
        </p>
      </div>
    </div>
  );
};