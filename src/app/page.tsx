import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💰</span>
          <span className={styles.logoText}>ExpenseFlow</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="/login">Sign In</Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          AI-Powered Expense Management.
          <br />
          <span className={styles.heroHighlight}>Simplified.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Streamline your expense tracking with AI-powered receipt scanning, 
          automated workflows, and real-time analytics. Save hours every week.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/signup">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>Everything you need</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📸</div>
            <h3>Smart Receipt Scanning</h3>
            <p>Upload receipts and our AI extracts merchant, amount, date, and category automatically.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Real-time Analytics</h3>
            <p>Track spending patterns, monitor budgets, and get insights into your expenses.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✅</div>
            <h3>Approval Workflows</h3>
            <p>Streamlined approval processes with multi-level workflows and automatic routing.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <h3>Team Collaboration</h3>
            <p>Chat with your team on every expense and report for seamless communication.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.pricing}>
        <h2 className={styles.sectionTitle}>Simple Pricing</h2>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <h3>Free</h3>
            <div className={styles.price}>$0</div>
            <p>Perfect for individuals</p>
            <ul>
              <li>Up to 25 expenses/month</li>
              <li>Basic receipt scanning</li>
              <li>Email support</li>
            </ul>
            <Link href="/signup">
              <Button variant="outline" className={styles.pricingCta}>Get Started</Button>
            </Link>
          </div>
          <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
            <div className={styles.pricingBadge}>Most Popular</div>
            <h3>Pro</h3>
            <div className={styles.price}>$15<span>/mo</span></div>
            <p>For professionals & small teams</p>
            <ul>
              <li>Unlimited expenses</li>
              <li>AI receipt scanning</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
            <Link href="/signup">
              <Button className={styles.pricingCta}>Get Started</Button>
            </Link>
          </div>
          <div className={styles.pricingCard}>
            <h3>Enterprise</h3>
            <div className={styles.price}>Custom</div>
            <p>For large organizations</p>
            <ul>
              <li>Everything in Pro</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
              <li>SLA guarantee</li>
            </ul>
            <Link href="/signup">
              <Button variant="outline" className={styles.pricingCta}>Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 ExpenseFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
