import { collection, getDocs, doc, deleteDoc, addDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { database } from '../../FirebaseConfig';
import emailjs from '@emailjs/browser';

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'CapeNaturals';

function ContactRequest() {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [emailContent, setEmailContent] = useState({ subject: '', message: '' });
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [repliedContacts, setRepliedContacts] = useState(new Set());
    const [filter, setFilter] = useState('all');
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    useEffect(() => {
        emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
        const savedRepliedContacts = localStorage.getItem('repliedContacts');
        if (savedRepliedContacts) {
            setRepliedContacts(new Set(JSON.parse(savedRepliedContacts)));
        }
    }, []);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, 'contactus'));
                const contactData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    isRead: doc.data().isRead || false,
                    ...doc.data(),
                }));
                setContacts(contactData);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                setStatus({ type: 'error', message: 'Failed to load contacts' });
            }
        };
        fetchContacts();
    }, []);

    // Fetch replies for a specific contact
    const fetchReplies = async (contactId) => {
        try {
            const repliesSnapshot = await getDocs(
                query(collection(database, 'contactus', contactId, 'replies'), orderBy('timestamp', 'asc'))
            );
            const replies = repliesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
            }));
            return replies;
        } catch (error) {
            console.error('Failed to fetch replies:', error);
            return [];
        }
    };

    // Handle contact selection
    const handleContactSelect = async (contact) => {
        console.log('Selected contact:', contact.id);
        setSelectedContact({ ...contact, isRead: true });
        await updateDoc(doc(database, 'contactus', contact.id), { isRead: true });
        setContacts(prev =>
            prev.map(item =>
                item.id === contact.id
                    ? { ...item, isRead: true }
                    : item
            ));
        setEmailContent({
            subject: `Re: ${contact.subject || 'Your inquiry'}`,
            message: ''
        });
        setStatus({ type: '', message: '' });

        // Load replies for this contact
        setIsLoadingReplies(true);
        try {
            const replies = await fetchReplies(contact.id);
            setSelectedContact(prev => prev ? { ...prev, replies } : null);
        } catch (error) {
            console.error('Error loading replies:', error);
        } finally {
            setIsLoadingReplies(false);
        }
    };

    // Send email and save reply to Firestore
    const handleSendEmail = async () => {
        if (!selectedContact || !emailContent.subject || !emailContent.message.trim()) {
            setStatus({ type: 'error', message: 'Please fill in all fields' });
            return;
        }

        setIsSending(true);
        setStatus({ type: '', message: '' });

        try {
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    to_name: selectedContact.name || 'Customer',
                    to_email: selectedContact.email,
                    from_name: BRAND_NAME,
                    subject: emailContent.subject,
                    emailContent: emailContent.message
                }
            );

            // Save reply to Firestore
            const replyData = {
                subject: emailContent.subject,
                message: emailContent.message,
                timestamp: new Date(),
                sentBy: BRAND_NAME
            };

            await addDoc(collection(database, 'contactus', selectedContact.id, 'replies'), replyData);

            // Update replied contacts
            const updatedRepliedContacts = new Set([...repliedContacts, selectedContact.id]);
            setRepliedContacts(updatedRepliedContacts);
            localStorage.setItem('repliedContacts', JSON.stringify([...updatedRepliedContacts]));

            // Refresh replies
            const updatedReplies = await fetchReplies(selectedContact.id);
            setSelectedContact(prev => prev ? { ...prev, replies: updatedReplies } : null);
            setEmailContent({ subject: '', message: '' });

            setStatus({ type: 'success', message: 'Reply sent' });

        } catch (error) {
            console.error('Failed to send email or save reply:', error);
            setStatus({ type: 'error', message: 'Failed to send reply. Please try again.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (window.confirm('Are you sure you want to delete this contact request and all its replies?')) {
            try {
                await deleteDoc(doc(database, 'contactus', contactId));
                setContacts(contacts.filter(contact => contact.id !== contactId));
                if (repliedContacts.has(contactId)) {
                    const updated = new Set(repliedContacts);
                    updated.delete(contactId);
                    setRepliedContacts(updated);
                    localStorage.setItem('repliedContacts', JSON.stringify([...updated]));
                }
                setStatus({ type: 'success', message: 'Contact deleted successfully.' });
                if (selectedContact?.id === contactId) setSelectedContact(null);
            } catch (error) {
                setStatus({ type: 'error', message: 'Failed to delete contact' });
            }
        }
    };
    const hasReplies = (contactId) => repliedContacts.has(contactId);
    const filteredContacts = contacts
        .filter(contact => {
            if (filter === 'all') return true;
            if (filter === 'unread') return !contact.isRead;
            return true;
        })
        .filter(contact =>
            contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.subject?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0;
            const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0;
            return timeB - timeA;
        });

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Unknown date';

        if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleString();
        }

        if (timestamp instanceof Date) {
            return timestamp.toLocaleString();
        }

        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="lg:ml-64 p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800">Contact Inquiries</h2>

                    <div className="text-sm text-gray-500">
                        {filteredContacts.length} of {contacts.length} requests
                    </div>
                </div>
                <div className="p-4 border-b">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-100 rounded-lg"
                    />
                </div>
                {status.message && (
                    <div className={`mb-6 p-4 rounded-md ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {status.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar - Contact List */}
                    <div className="lg:col-span-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-700">Contact Requests</h3>
                                <div className="flex space-x-1">
                                    {['all', 'unread'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilter(type)}
                                            className={`px-3 py-1 text-xs rounded-full ${filter === type
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-full overflow-y-auto">
                            {filteredContacts.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <p>No contact requests found</p>
                                </div>
                            ) : (
                                filteredContacts.map(contact => (
                                    <div
                                        key={contact.id}
                                        className={`p-4 cursor-pointer transition-colors ${selectedContact?.id === contact.id
                                            ? 'bg-yellow-50 border-l-4 border-yellow-500'
                                            : ' border-l border-transparent hover:bg-gray-50'}`}
                                        onClick={() => handleContactSelect(contact)}
                                    >
                                        <div className="flex justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                                                    {!contact.isRead && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            Unread
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">{contact.subject || '(No subject)'}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatTimestamp(contact.timestamp)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteContact(contact.id);
                                                }}
                                                className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                                                title="Delete contact"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content - Message View */}
                    <div className="lg:col-span-8 rounded-lg overflow-hidden flex flex-col">
                        {selectedContact ? (
                            <>
                                {/* Message Header */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50 w-full">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {selectedContact.subject || 'No Subject'}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                From: {selectedContact.name} &lt;{selectedContact.email}&gt;
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-500 text-right">
                                            {formatTimestamp(selectedContact.timestamp)}
                                        </div>
                                    </div>
                                </div>

                                {/* Message History */}
                                <div className="flex-1 overflow-y-auto">
                                    {/* Original Message */}
                                    <div className="p-6 border-b border-gray-200 w-full">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-yellow-600 font-medium text-sm">
                                                    {selectedContact.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-gray-900">{selectedContact.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimestamp(selectedContact.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="mt-2 prose max-w-none">
                                                    <p className="whitespace-pre-line text-gray-700">
                                                        {selectedContact.message || selectedContact.queries || 'No message content'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {isLoadingReplies ? (
                                        <div className="p-6 text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brandyellow mx-auto"></div>
                                            <p className="text-sm text-gray-500 mt-2">Loading replies...</p>
                                        </div>
                                    ) : selectedContact.replies && selectedContact.replies.length > 0 ? (
                                        selectedContact.replies.map((reply, index) => (
                                            <div key={reply.id || index} className="p-6 border-b border-gray-200 bg-gray-50">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-green-600 font-medium text-sm">
                                                            {BRAND_NAME.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-gray-900">{BRAND_NAME}</span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatTimestamp(reply.timestamp)}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-medium text-gray-800 mt-1">{reply.subject}</h4>
                                                        <div className="mt-2 prose max-w-none">
                                                            <p className="whitespace-pre-line text-gray-700">
                                                                {reply.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-gray-500">
                                            <p>No replies yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Reply Section */}
                                <div className="border-t border-gray-200 bg-white p-6 w-full">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Send Reply</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                            <input
                                                type="text"
                                                value={emailContent.subject}
                                                onChange={e => setEmailContent({ ...emailContent, subject: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                                placeholder="Enter subject..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                            <textarea
                                                rows={6}
                                                value={emailContent.message}
                                                onChange={e => setEmailContent({ ...emailContent, message: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-vertical"
                                                placeholder={`Type your reply to ${selectedContact.name}...`}
                                            />
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => setEmailContent({ subject: '', message: '' })}
                                                className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                                                disabled={isSending}
                                            >
                                                Clear
                                            </button>
                                            <button
                                                onClick={handleSendEmail}
                                                disabled={isSending || !emailContent.message.trim()}
                                                className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-sm ${isSending || !emailContent.message.trim()
                                                    ? 'bg-yellow-400 cursor-not-allowed'
                                                    : 'bg-brandyellow hover:bg-yellow-700'
                                                    }`}
                                            >
                                                {isSending ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Sending...
                                                    </>
                                                ) : 'Send Reply'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-start justify-start p-8 text-center">
                                <div className="max-w-md">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <h3 className="mt-3 text-lg font-medium text-gray-900">No message selected</h3>
                                    <p className="mt-1 text-sm text-gray-500">Choose a contact request from the list to view details and send replies</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactRequest;