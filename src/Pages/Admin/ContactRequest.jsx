import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
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
    const [sentEmails, setSentEmails] = useState(new Set());
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
        const savedSentEmails = localStorage.getItem('sentEmails');
        if (savedSentEmails) {
            setSentEmails(new Set(JSON.parse(savedSentEmails)));
        }
    }, []);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, 'contactus'));
                const contactData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
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

    const handleContactSelect = (contact) => {
        setSelectedContact(contact);
        setEmailContent({
            subject: `Hi ${contact.name}, thanks for contacting ${BRAND_NAME}`,
            message: `Dear ${contact.name || 'Customer'},\n\nThank you for reaching out to us regarding "${contact.subject || 'your inquiry'}".\n\n We appreciate your patience and will get back to you shortly.\n\nBest regards,\n${BRAND_NAME} Team`
        });
        setStatus({ type: '', message: '' });
    };

    const handleSendEmail = async () => {
        if (!selectedContact || !emailContent.subject || !emailContent.message) {
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
                    queries: selectedContact.message || selectedContact.queries || 'No query provided',
                }
            );

            const updatedSentEmails = new Set(sentEmails).add(selectedContact.id);
            setSentEmails(updatedSentEmails);
            localStorage.setItem('sentEmails', JSON.stringify([...updatedSentEmails]));

            setStatus({ type: 'success', message: 'Email sent successfully!' });
        } catch (error) {
            console.error('Failed to send email:', error);
            setStatus({ type: 'error', message: 'Failed to send email. Please try again.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (window.confirm('Are you sure you want to delete this contact request?')) {
            try {
                await deleteDoc(doc(database, 'contactus', contactId));
                setContacts(contacts.filter(contact => contact.id !== contactId));
                if (sentEmails.has(contactId)) {
                    const updated = new Set(sentEmails);
                    updated.delete(contactId);
                    setSentEmails(updated);
                    localStorage.setItem('sentEmails', JSON.stringify([...updated]));
                }
                setStatus({ type: 'success', message: 'Contact deleted successfully.' });
                if (selectedContact?.id === contactId) setSelectedContact(null);
            } catch (error) {
                setStatus({ type: 'error', message: 'Failed to delete contact' });
            }
        }
    };

    const isEmailSent = (id) => sentEmails.has(id);

    const filteredContacts = contacts
        .filter(contact => {
            if (filter === 'all') return true;
            if (filter === 'new') return !isEmailSent(contact.id);
            if (filter === 'replied') return isEmailSent(contact.id);
            return true;
        })
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    return (
        <div className="lg:ml-64 p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800">Contact Inquiries</h2>
                    <div className="text-sm text-gray-500">
                        {filteredContacts.length} of {contacts.length} requests shown
                    </div>
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
                                <h3 className="font-medium text-gray-700">Recent Messages</h3>
                                <div className="flex space-x-1">
                                    {['all', 'new', 'replied'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilter(type)}
                                            className={`px-3 py-1 text-xs rounded-full ${filter === type
                                                ? 'bg-brandyellow text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
                            {filteredContacts.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <p>No contact requests found</p>
                                </div>
                            ) : (
                                filteredContacts.map(contact => (
                                    <div
                                        key={contact.id}
                                        className={`p-4 cursor-pointer transition-colors ${selectedContact?.id === contact.id
                                            ? 'bg-blue-50'
                                            : 'hover:bg-gray-50'}`}
                                        onClick={() => handleContactSelect(contact)}
                                    >
                                        <div className="flex justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                                                    {isEmailSent(contact.id) && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            Replied
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">{contact.subject || '(No subject)'}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(contact.timestamp?.seconds * 1000).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteContact(contact.id);
                                                }}
                                                className="text-gray-400 hover:text-red-500 ml-2"
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
                    <div className="lg:col-span-8 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
                        {selectedContact ? (
                            <>
                                {/* Message Header - Compact */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50 w-full">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {selectedContact.subject || 'No Subject'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            From: {selectedContact.name} &lt;{selectedContact.email}&gt;
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(selectedContact.timestamp?.seconds * 1000).toLocaleString()}
                                    </div>
                                </div>

                                {/* Original Message - Focused */}
                                <div className="flex-1 p-6 overflow-y-auto">
                                    <div className="max-w-3xl p-6">
                                        <div className="prose max-w-none">
                                            <p className="whitespace-pre-line text-gray-700">
                                                {selectedContact.message || selectedContact.queries}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reply Section - Prominent */}
                                <div className="border-t border-gray-200 bg-white w-full p-4">
                                    {/* <div className="w-full"> */}
                                    <div className="mb-6 w-full">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Reply to Customer</h4>
                                        {isEmailSent(selectedContact.id) ? (
                                            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                                                <div className="flex items-center text-green-700">
                                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-medium">Reply sent successfully</span>
                                                </div>
                                                <div className="mt-3 p-3 bg-white rounded border border-green-100">
                                                    <pre className="whitespace-pre-wrap font-sans text-gray-700">{emailContent.message}</pre>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                                        <input
                                                            type="text"
                                                            value={emailContent.subject}
                                                            onChange={e => setEmailContent({ ...emailContent, subject: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder={`Re: ${selectedContact.subject || 'Your inquiry'}`}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                                        <textarea
                                                            rows={8}
                                                            value={emailContent.message}
                                                            onChange={e => setEmailContent({ ...emailContent, message: e.target.value })}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[250px]"
                                                            placeholder={`Dear ${selectedContact.name.split(' ')[0]},\n\nThank you for contacting us...`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => setEmailContent({ subject: '', message: '' })}
                                                        className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Discard
                                                    </button>
                                                    <button
                                                        onClick={handleSendEmail}
                                                        disabled={isSending}
                                                        className={`px-6 py-2.5 rounded-lg font-medium text-white ${isSending ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} shadow-sm`}
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
                                            </>
                                        )}
                                    </div>
                                    {/* </div> */}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="max-w-md">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <h3 className="mt-3 text-lg font-medium text-gray-900">No message selected</h3>
                                    <p className="mt-1 text-sm text-gray-500">Choose a customer message from the list to view and respond</p>
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