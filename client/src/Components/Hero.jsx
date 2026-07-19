import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Trophy, Sparkles } from 'lucide-react';
import './Hero.css';

function Hero() {
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || field.childElementCount > 0) return;
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      const size = 2 + Math.random() * 3;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.animationDuration = `${6 + Math.random() * 6}s`;
      p.style.animationDelay = `${Math.random() * 5}s`;
      field.appendChild(p);
    }
  }, []);

  return (
    <section className="oj-hero" aria-label="Intro">
      <div className="oj-hero-floor" />
      <div className="oj-hero-particles" ref={fieldRef} />
      <div className="oj-hero-ribbon" />

      <div className="oj-hero-textzone">
        <div className="oj-hero-eyebrow">
          <span className="oj-hero-dot" />
          AI-Powered Coding Platform
        </div>

        <h1 className="oj-hero-headline">
          Code Your Vision.<br />
          <span className="oj-hero-glow">Build Your Future.</span>
        </h1>

        <p className="oj-hero-sub">
          A cloud-native coding platform with real-time judging, coding contests,
          leaderboard rankings, and AI-powered learning tools.
        </p>

        <div className="oj-hero-cta-row">
          <Link to="/problems" className="oj-hero-cta">
            <ListChecks size={17} />
            Browse Problems
          </Link>
          <Link to="/leaderboard" className="oj-hero-cta">
            <Trophy size={17} />
            View Leaderboard
          </Link>
        </div>
      </div>

      <div className="oj-hero-scene">
        <div className="oj-hero-desk-glow" />
        <div className="oj-hero-cluster">
          <div className="oj-hero-holo">
            <div className="oj-holo-title"><Sparkles size={10} /> AI Assistant</div>
            <div className="oj-holo-line com">// suggesting optimization...</div>
            <div className="oj-holo-line"><span className="kw">O(n)</span> <span className="fn">solution found</span></div>
          </div>

          <div className="oj-monitor m-left">
            <div className="m-bar"><span /><span /><span /></div>
            <div className="m-body">
              <div><span className="ln">01</span><span className="com">// judge.log</span></div>
              <div><span className="ln">02</span><span className="kw">verdict:</span> <span className="str">Accepted</span></div>
              <div><span className="ln">03</span><span className="kw">runtime:</span> <span className="fn">42ms</span></div>
              <div><span className="ln">04</span><span className="kw">memory:</span> <span className="fn">14.2MB</span></div>
              <div><span className="ln">05</span><span className="txt">status: ● live</span></div>
            </div>
          </div>

          <div className="oj-monitor m-center">
            <div className="m-bar"><span /><span /><span /></div>
            <div className="m-body">
              <div><span className="ln">01</span><span className="kw">function</span> <span className="fn">twoSum</span>(nums, target) {'{'}</div>
              <div><span className="ln">02</span>&nbsp;&nbsp;<span className="kw">const</span> seen = <span className="kw">new</span> <span className="fn">Map</span>()</div>
              <div><span className="ln">03</span>&nbsp;&nbsp;<span className="kw">for</span> (<span className="kw">let</span> i = 0; i &lt; nums.length; i++) {'{'}</div>
              <div><span className="ln">04</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="kw">const</span> need = target - nums[i]</div>
              <div><span className="ln">05</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="kw">if</span> (seen.<span className="fn">has</span>(need)) <span className="kw">return</span> [seen.<span className="fn">get</span>(need), i]</div>
              <div><span className="ln">06</span>&nbsp;&nbsp;&nbsp;&nbsp;seen.<span className="fn">set</span>(nums[i], i)</div>
              <div><span className="ln">07</span>&nbsp;&nbsp;{'}'}</div>
              <div><span className="ln">08</span>{'}'}</div>
              <div className="oj-ai-chip">✦ AI Copilot: 3 suggestions ready</div>
            </div>
          </div>

          <div className="oj-monitor m-right">
            <div className="m-bar"><span /><span /><span /></div>
            <div className="m-body">
              <div><span className="ln">01</span><span className="com">// contest stats</span></div>
              <div><span className="ln">02</span>tests <span className="fn">✓</span> 12/12</div>
              <div><span className="ln">03</span>rank <span className="str">#128</span></div>
              <div><span className="ln">04</span>rating <span className="fn">+24</span> ▁▃▅▇▅▇</div>
              <div><span className="ln">05</span>streak <span className="str">7 days</span></div>
            </div>
          </div>
        </div>

        <div className="oj-hero-rack">
          <div className="u"><i /></div>
          <div className="u"><i /></div>
          <div className="u"><i /></div>
          <div className="u"><i /></div>
          <div className="u"><i /></div>
        </div>
      </div>

      <div className="oj-hero-footer-tag">
        Cloud-Native · Real-Time Judging · AI-Assisted Learning
      </div>
    </section>
  );
}

export default Hero;
