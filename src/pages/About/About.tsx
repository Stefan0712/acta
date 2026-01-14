import { useEffect, useState } from 'react';
import { IconsLibrary } from '../../assets/icons';
import Header from '../../components/Header/Header';
import styles from './About.module.css';
import { Github, Linkedin } from 'lucide-react';
import { checkApi } from '../../services/authService';


const About = () => {

    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
    const [showTOS, setShowTOS] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [isApiOn, setIsApiOn] = useState(false);
    
    const checkIfAPIisOn = async () => {
        try {
            const response = await checkApi();
            setIsApiOn(response)
        } catch ( error ) {
            console.error(error);
        }
    }
    useEffect(()=>{
        checkIfAPIisOn()
    },[])

    return (
        <div className={styles.about}>
            <Header title='About' />
            <div className={styles.aboutContent}>
                <div className={styles.section}>
                    <div className={styles.header} onClick={()=>setShowPrivacyPolicy(prev=>!prev)}>
                        <h2>Privacy Policy</h2>
                        <IconsLibrary.Arrow style={showPrivacyPolicy ? {transform: 'rotateZ(-90deg)'} : {}} />
                    </div>
                    {showPrivacyPolicy ? 
                        <div className={styles.sectionContent}>
                            <h1>Privacy Policy for Acta</h1>
                            <p><b>Last Updated:</b> January 3, 2026</p>

                            <h2>1. Introduction </h2>
                            <p>This Privacy Policy explains how <b>Acta</b> ("we", "us", or "our") collects, uses, and protects your information. Acta is an application developed by <b>Stefan Vladulescu</b> as a personal project. We are committed to protecting your personal data in accordance with the <b>General Data Protection Regulation (GDPR)</b>.</p>

                            <h2>2. Data </h2>
                            <p><b>Owner:</b> Stefan Vladulescu</p>
                            <p><b>Location:</b> Tulcea, Romania</p>
                            <p><b>Contact Email:</b> support@stefanvladulescu.com</p>

                            <h2> 3. Data We Collect</h2>
                            <p>We collect only the minimum amount of data required for the application to function:</p>

                            <h2> A. Account Information</h2>
                            <p><b>Username, Email & Password:</b> Encrypted and stored to allow you to log in and recover account.</p>
                            <p><b>User ID:</b> A unique identifier generated for your account.</p>

                            <h2> B. User Content</h2>
                            <p><b>Notes, Lists, Polls, and Items:</b> The text content you create within the app.</p>
                            <p><b>Metadata:</b> Timestamps (created at, updated at) and status flags (e.g., "isPinned").</p>

                            <h2> C. Technical Data</h2>
                            <p><b>Local Storage & IndexedDB:</b> We use your browser's local storage (via Dexie.js) to save your data on your device. This allows the app to work offline and synchronize when you are back online.</p>
                            <p><b>Logs:</b> Our server may temporarily record IP addresses for security purposes (to prevent abuse or DDoS attacks), but this data is not linked to your user profile for tracking.</p>

                            <h2> 4. How We Use Your Data</h2>
                            <p>We use your data solely for the following purposes:</p>
                            <p>1. <b>Authentication:</b> To identify you and secure your account.</p>
                            <p>2. <b>Synchronization:</b> To sync your notes between your local device and our backend server.</p>
                            <p>3. <b>Functionality:</b> To enable offline access and persistent settings.</p>

                            <p><b>We do NOT:</b></p>
                            <p>Sell your data to third parties.</p>
                            <p>Use your data for advertising.</p>
                            <p>Track your activity across other websites.</p>

                            <h2> 5. Where Your Data is Stored</h2>
                            <p><b>Frontend:</b> Hosted on <b>GitHub Pages</b>.</p>
                            <p><b>Backend & Database:</b> Processed and stored on self-hosted infrastructure managed directly by the Owner.</p>
                            <p><b>Local Device:</b> A copy of your data is stored in your browser's IndexedDB for performance and offline capabilities.</p>

                            <h2> 6. Cookies and Local Storage</h2>
                            <p>We do not use tracking cookies. We use <b>Local Storage</b> and <b>IndexedDB</b> strictly for "essential" purposes (maintaining your session and offline data). Under EU ePrivacy Directive, explicit consent (a banner) is not required for strictly necessary technical storage.</p>

                            <h2> 7. Your Rights (GDPR)</h2>
                            <p>Under the GDPR, you have the following rights:</p>
                            <p><b>Right to Access:</b> You may request a copy of all data we hold about you.</p>
                            <p><b>Right to Rectification:</b> You can edit your notes and profile directly in the app.</p>
                            <p><b>Right to Erasure ("Right to be Forgotten"):</b> You can delete your account at any time. <b>Deletion is permanent and instant.</b> Once deleted, your data cannot be recovered from our servers.</p>
                            <p><b>Right to Data Portability:</b> You can copy your text data out of the application at any time.</p>

                            <p>To exercise these rights, please contact us at <b>support@stefanvladulescu.com</b>.</p>
                            <h2>8. Changes to This Policy</h2>
                            <p>We may update our Privacy Policy from time to time as the application evolves(e.g., if we add new features like payments or advertising).</p>
                            <p><b>Minor Changes:</b> We will post the new Privacy Policy on this page and update the "Last Updated" date at the top. You are advised to review this page periodically for any changes. </p>
                            <p><b>Significant Changes:</b> If we make material changes to how we use your personal data (such as introducing third-party advertising or payment processing), we will provide a more prominent notice (e.g., a notification inside the app or via email).</p>
                            <p>Continued use of the application after any changes constitutes your acceptance of the new Privacy Policy.</p>
                        </div> 
                    : null}
                </div>
                <div className={styles.section}>
                    <div className={styles.header} onClick={()=>setShowTOS(prev=>!prev)}>
                        <h2>Terms of Service</h2>
                        <IconsLibrary.Arrow style={showTOS ? {transform: 'rotateZ(-90deg)'} : {}} />
                    </div>
                    {showTOS ? <div className={styles.sectionContent}>
                            <h1>Terms of Service</h1>
                            <p><b>Last Updated:</b> January 3, 2026</p>

                            <h2> 1. Acceptance of Terms </h2>
                            <p>By creating an account or using <b>Acta</b>, you agree to these Terms. If you do not agree, you may not use the service.</p>

                            <h2> 2. Description of Service </h2>
                            <p>Acta is a personal project provided "as is". It allows users to create, store, and synchronize notes and lists.</p>

                            <h2> 3. No Warranty (The "As Is" Clause) </h2>
                            <p><b>This is important:</b> Acta is provided <b>without warranties of any kind</b>.</p>
                            <p>We do not guarantee that the service will be uninterrupted, secure, or error-free.</p>
                            <p>We are <b>not responsible for any data loss</b>. While we take backups and security seriously, you use this service at your own risk. Please do not store critical, sensitive, or irreplaceable information (like passwords or financial data) in your notes.</p>

                            <h2> 4. User Conduct </h2>
                            <p>You agree not to use Acta to:</p>
                            <p>Upload illegal content.</p>
                            <p>Attempt to hack, disrupt, or overwhelm our API (e.g., DDoS attacks).</p>
                            <p>Reverse engineer the proprietary backend software.</p>

                            <h2> 5. Termination </h2>
                            <p>We reserve the right to suspend or delete your account if you violate these terms or abuse the service. You may delete your account at any time.</p>

                            <h2> 6. Governing Law </h2>
                            <p>These terms are governed by the laws of <b>Romania</b>.</p>

                            <h2> 7. Contact </h2>
                            <p>For any questions regarding these Terms, please contact <b>support@stefanvladulescu.com</b>.</p>
                    </div> : null}
                </div>
                <div className={styles.section}>
                    <div className={styles.header} onClick={()=>setShowContact(prev=>!prev)}>
                        <h2>Contact</h2>
                        <IconsLibrary.Arrow  style={showContact ? {transform: 'rotateZ(-90deg)'} : {}} />
                    </div>
                    {showContact ? <div className={styles.sectionContent}>
                        <div className={styles.contactItem}>
                            <b>Email: </b>
                            <p>support@stefanvladulescu.com</p>
                        </div>
                        <div className={styles.contactItem}>
                            <b>Github Profile: </b>
                            <a href='https://github.com/Stefan0712' target='_blank'><Github /> Stefan0712</a>
                        </div>
                        <div className={styles.contactItem}>
                            <b>LinkedIn: </b>
                            <a href='https://www.linkedin.com/in/stefan-vladulescu/' target='_blank'><Linkedin /> Stefan Vladulescu</a>
                        </div>
                    </div> : null}
                </div>
                <div className={styles.apiStatus}>
                    {isApiOn ? <p>API is up</p> : <p>API is down</p>}
                    <div className={styles.statusCircle} style={isApiOn ? {backgroundColor: 'green'} : {backgroundColor: 'red'}} />
                </div>
                <p className={styles.versionText}>V3.4.2 - 1/14/2026 23:36</p>
            </div>
        </div>
    )
}

export default About;