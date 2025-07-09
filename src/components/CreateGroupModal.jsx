import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { X, Users, Search } from 'lucide-react';
import { CHAT_API_END_POINT } from '@/constants';
import axios from 'axios';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [availableMembers, setAvailableMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { user } = useSelector(store => store.auth);

    // Fetch available members
    const fetchAvailableMembers = async () => {
        try {
            const response = await axios.get(`${CHAT_API_END_POINT}/members/available`, {
                headers: {
                    'Authorization': `Bearer ${user?.accessToken}`,
                },
                withCredentials: true
            });

            if (response.data.success) {
                setAvailableMembers(response.data.data || []);
            }
        } catch (error) {
            setError('Error fetching available members');
        }
    };

    // Create group
    const createGroup = async () => {
        if (!groupName.trim()) {
            setError('Group name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${CHAT_API_END_POINT}/groups`,
                {
                    name: groupName.trim(),
                    description: groupDescription.trim(),
                    memberIds: selectedMembers
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.accessToken}`,
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                onGroupCreated(response.data.data);
                handleClose();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error creating group';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setGroupName('');
        setGroupDescription('');
        setSelectedMembers([]);
        setSearchTerm('');
        setError('');
        onClose();
    };

    const toggleMemberSelection = (memberId) => {
        setSelectedMembers(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    // Filter members based on search
    const filteredMembers = availableMembers.filter(member => {
        const name = member.name || '';
        const email = member.email || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
        if (isOpen) {
            fetchAvailableMembers();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Create New Group</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="space-y-4 flex-1 overflow-y-auto">
                    {/* Group Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Name *
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={50}
                        />
                    </div>

                    {/* Group Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            placeholder="Enter group description"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={200}
                        />
                    </div>

                    {/* Members Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Members ({selectedMembers.length} selected)
                        </label>
                        
                        {/* Search Members */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search members..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Members List */}
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                            {filteredMembers.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    {searchTerm ? 'No members found' : 'No available members'}
                                </div>
                            ) : (
                                filteredMembers.map(member => (
                                    <div
                                        key={member._id}
                                        onClick={() => toggleMemberSelection(member._id)}
                                        className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                                                {(member.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{member.name || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{member.email || 'No email'}</div>
                                                <div className="text-xs text-blue-600">{member.type || 'User'}</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(member._id)}
                                            onChange={() => {}}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={createGroup}
                        disabled={loading || !groupName.trim()}
                        className="flex items-center space-x-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Users className="h-4 w-4" />
                        )}
                        <span>{loading ? 'Creating...' : 'Create Group'}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal; 