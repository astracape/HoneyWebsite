import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { database } from '../../FirebaseConfig';
import emailjs from '@emailjs/browser';

function ContactRequest() {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [emailContent, setEmailContent] = useState({
        subject: '',
        message: ''
    });
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [sentEmails, setSentEmails] = useState(new Set());
    const [filter, setFilter] = useState('all'); // 'all', 'new', 'replied'

    // Initialize EmailJS and load sent emails
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
                const querySnapshot = await getDocs(collection(database, "contactus"));
                const contactData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setContacts(contactData);
            } catch (error) {
                console.error("Error fetching contacts:", error);
                setStatus({ type: 'error', message: 'Failed to load contacts' });
            }
        };
        fetchContacts();
    }, []);

    const handleContactSelect = (contact) => {
        setSelectedContact(contact);
        setEmailContent({
            subject: `Re: Your contact request from ${new Date(contact.timestamp?.seconds * 1000).toLocaleDateString()}`,
            message: `Dear ${contact.name || 'Customer'},\n\nThank you for reaching out to us regarding "${contact.subject || 'your inquiry'}".\n\n`
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
                    to_email: selectedContact.email,
                    from_name: 'Capenaturals',
                    subject: emailContent.subject,
                    message: emailContent.message,
                }
            );

            const updatedSentEmails = new Set(sentEmails).add(selectedContact.id);
            setSentEmails(updatedSentEmails);
            localStorage.setItem('sentEmails', JSON.stringify([...updatedSentEmails]));

            setStatus({ type: 'success', message: 'Email sent successfully!' });
            setEmailContent({ subject: '', message: '' });
            
            setTimeout(() => {
                setSelectedContact(null);
                setStatus({ type: '', message: '' });
            }, 3000);
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
                await deleteDoc(doc(database, "contactus", contactId));
                setContacts(contacts.filter(contact => contact.id !== contactId));
                setStatus({ type: 'success', message: 'Contact request deleted successfully!' });
                
                if (sentEmails.has(contactId)) {
                    const updatedSentEmails = new Set(sentEmails);
                    updatedSentEmails.delete(contactId);
                    setSentEmails(updatedSentEmails);
                    localStorage.setItem('sentEmails', JSON.stringify([...updatedSentEmails]));
                }
                
                if (selectedContact?.id === contactId) {
                    setSelectedContact(null);
                }
            } catch (error) {
                console.error("Error deleting contact:", error);
                setStatus({ type: 'error', message: 'Failed to delete contact request' });
            }
        }
    };

    const isEmailSent = (contactId) => sentEmails.has(contactId);

    // Filter contacts based on current filter
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
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Contact Requests</h2>

                {status.message && (
                    <div className={`mb-4 p-4 rounded border-t-2 ${status.type === 'error' ? 'bg-red-100 text-red-700 border-t-2 border-red-500' : 'bg-green-100 text-green-700 border-green-500'}`}>
                        {status.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contact List - Recent Requests */}
                    <div className="lg:col-span-1 bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-4 bg-yellow-600 text-white">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">Recent Requests</h3>
                                <div className="text-xs bg-yellow-500 px-2 py-1 rounded">
                                    {filteredContacts.length} shown • {contacts.length} total
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`text-xs px-2 py-1 rounded ${filter === 'all' ? 'bg-white text-yellow-600' : 'bg-yellow-500 text-white'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('new')}
                                    className={`text-xs px-2 py-1 rounded ${filter === 'new' ? 'bg-white text-yellow-600' : 'bg-yellow-500 text-white'}`}
                                >
                                    New
                                </button>
                                <button
                                    onClick={() => setFilter('replied')}
                                    className={`text-xs px-2 py-1 rounded ${filter === 'replied' ? 'bg-white text-yellow-600' : 'bg-yellow-500 text-white'}`}
                                >
                                    Replied
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                            {filteredContacts.length === 0 ? (
                                <div className="p-4 text-gray-500">
                                    {filter === 'all' 
                                        ? 'No contact requests yet.' 
                                        : filter === 'new' 
                                            ? 'No new contact requests.' 
                                            : 'No replied contact requests.'}
                                </div>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${selectedContact?.id === contact.id ? 'bg-indigo-50' : ''}`}
                                    >
                                        {/* Status indicator dot */}
                                        <div className={`absolute top-9 left-3 h-2.5 w-2.5 rounded-full ${isEmailSent(contact.id) ? '' : 'bg-green-500'}`}></div>
                                        
                                        <div className="ml-5">
                                            <div className="flex justify-between items-start pr-3">
                                                <div onClick={() => handleContactSelect(contact)} className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{contact.name || 'No Name'}</h4>
                                                    <p className="text-sm text-gray-600">{contact.email}</p>
                                                </div>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {new Date(contact.timestamp?.seconds * 1000).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div onClick={() => handleContactSelect(contact)}>
                                                {contact.subject && (
                                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                                        {contact.subject}
                                                    </p>
                                                )}
                                                {contact.message && (
                                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                                        {contact.message}
                                                    </p>
                                                )}
                                                {isEmailSent(contact.id) && (
                                                    <div className="mt-2 flex items-center text-xs text-green-600">
                                                        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Replied
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3 flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleDeleteContact(contact.id)}
                                                    className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Email Composition Panel */}
                    <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
                        {selectedContact ? (
                            <>
                                <div className="p-4 bg-yellow-600 text-white flex justify-between items-center">
                                    <div className="flex items-center">
                                        <h3 className="text-lg font-semibold">Reply to {selectedContact.name || selectedContact.email}</h3>
                                    </div>
                                    {isEmailSent(selectedContact.id) && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                            </svg>
                                            Response Sent
                                        </span>
                                    )}
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            value={emailContent.subject}
                                            onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            rows="8"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            value={emailContent.message}
                                            onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setSelectedContact(null)}
                                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSendEmail}
                                            disabled={isSending || isEmailSent(selectedContact.id)}
                                            className={`px-4 py-2 rounded-md text-white ${isSending ? 'bg-yellow-400' : isEmailSent(selectedContact.id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                        >
                                            {isSending ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </span>
                                            ) : isEmailSent(selectedContact.id) ? 'Already Sent' : 'Send Email'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No contact selected</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Select a contact request from the list to compose a reply.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactRequest;