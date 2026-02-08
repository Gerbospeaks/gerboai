import { useState, useRef, useEffect } from 'react';
import './TimelineNavigation.css';

function TimelineNavigation() {
  const [activeTab, setActiveTab] = useState('present');
  const [targetTab, setTargetTab] = useState(null);
  const [mode, setMode] = useState('idle');
  const [activeBarStyle, setActiveBarStyle] = useState({});
  const [hoverBarStyle, setHoverBarStyle] = useState({});
  
  const itemsRef = useRef([]);

  const tabs = [
    { id: 'paid', label: 'Paid' },
    { id: 'sent', label: 'Sent' },
    { id: 'draft', label: 'Draft' }
  ];

  useEffect(() => {
    updateBarPositions();
  }, [activeTab, targetTab]);

  const updateBarPositions = () => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const targetIndex = tabs.findIndex(tab => tab.id === targetTab);

    if (itemsRef.current[activeIndex]) {
      const activeEl = itemsRef.current[activeIndex];
      setActiveBarStyle({
        width: `${activeEl.offsetWidth}px`,
        transform: `translateX(${activeEl.offsetLeft}px)`
      });
    }

    if (targetIndex >= 0 && itemsRef.current[targetIndex]) {
      const targetEl = itemsRef.current[targetIndex];
      setHoverBarStyle({
        width: `${targetEl.offsetWidth}px`,
        transform: `translateX(${targetEl.offsetLeft}px)`
      });
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleMouseEnter = (tabId) => {
    setMode('hover');
    setTargetTab(tabId);
  };

  const handleMouseLeave = () => {
    setMode('idle');
    setTargetTab(null);
  };

  return (
    <div className="stickyWrapper">
      <nav
        className="container"
        data-center="true"
        data-position="bottom"
        data-present-homepage="false"
        data-mode={mode}
        role="navigation"
        aria-label="Timeline navigation"
      >
        <div className="items" role="tablist">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={el => itemsRef.current[index] = el}
              className="item"
              data-active={activeTab === tab.id}
              data-target={targetTab === tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`timeline-panel-${tab.id}`}
              id={`timeline-tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => handleTabClick(tab.id)}
              onMouseEnter={() => handleMouseEnter(tab.id)}
              onMouseLeave={handleMouseLeave}
            >
              {tab.label}
            </button>
          ))}

          <div
            className="backgroundBarActive"
            aria-hidden="true"
            data-visible={activeTab !== null}
            style={activeBarStyle}
          />

          <div
            className="backgroundBar"
            aria-hidden="true"
            data-visible={targetTab !== null}
            style={hoverBarStyle}
          />
        </div>
      </nav>
    </div>
  );
}

export default TimelineNavigation;