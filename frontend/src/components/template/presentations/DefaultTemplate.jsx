/*
 * Copyright 2020 Bitnine Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import EditorContainer from '../../contents/containers/Editor';
import Sidebar from '../../sidebar/containers/Sidebar';
import Contents from '../../contents/containers/Contents';
import { loadFromCookie, saveToCookie } from '../../../features/cookie/CookieUtil';
import logoImage from './logo.png';
import ResizableSplitLayout from '../../splitlayout/ResizableSplitLayout';
import '../../splitlayout/split-pane.css';

const HeaderStyles = {
  height: '64px',
  // padding: '0 50px',
  color: 'rgba(0, 0, 0, 0.85)',
  lineHeight: '64px',
  background: '#001529',
  // margin: '5px 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const FooterStyles = {
  // padding: '24px 50px',
  color: 'var(--primary-color)',
  fontSize: '14px',
  background: 'var(--footer-bg-color)',
  textAlign: 'center',
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: '67%',
  padding: '5px 5px',
  zIndex: 1000,

};

const DefaultTemplate = ({
  theme,
  maxNumOfFrames,
  maxNumOfHistories,
  maxDataOfGraph,
  maxDataOfTable,
  changeSettings,
}) => {
  const dispatch = useDispatch();
  const [stateValues] = useState({
    theme,
    maxNumOfFrames,
    maxNumOfHistories,
    maxDataOfGraph,
    maxDataOfTable,
  });

  useEffect(() => {
    let isChanged = false;
    const cookieState = {
      theme,
      maxNumOfFrames,
      maxNumOfHistories,
      maxDataOfGraph,
      maxDataOfTable,
    };

    Object.keys(stateValues).forEach((key) => {
      let fromCookieValue = loadFromCookie(key);

      if (fromCookieValue !== undefined && key !== 'theme') {
        fromCookieValue = parseInt(fromCookieValue, 10);
      }

      if (fromCookieValue === undefined) {
        saveToCookie(key, stateValues[key]);
      } else if (fromCookieValue !== stateValues[key]) {
        cookieState[key] = fromCookieValue;
        isChanged = true;
      }
    });

    if (isChanged) {
      dispatch(() => changeSettings(Object.assign(stateValues, cookieState)));
    }
  });

  return (
    <ResizableSplitLayout
      minSize={250}
      defaultSize="33%"
      maxSize={900}
      primary="first"
    >
      {/* SIDEBAR (Left Pane) */}
      <div
        className="editor-division"
        style={{
          height: '100vh', width: '100%', display: 'flex', flexDirection: 'column',
        }}
      >
        <header
          style={HeaderStyles}
        >
          <img
            src={logoImage}
            alt="AgensGraph Logo"
            style={{ maxHeight: '100%', maxWidth: '100%', height: 'auto' }}
          />
        </header>
        <EditorContainer />
        <Sidebar />
      </div>

      {/* CONTENTS (Right Pane) */}
      <div style={{
        height: '100vh', width: '100%', display: 'flex', flexDirection: 'column',
      }}
      >
        <Contents style={{ flex: 1 }} />

        <footer
          className="flex-end"
          style={FooterStyles}
        >
          Copyright © 2025 SKAI Worldwide Co., Ltd. All Rights Reserved.
          <br />
          <a
            href="https://www.skaiworldwide.com/en-US/resources?filterKey=manual"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check AgensGraph Documentation
          </a>
        </footer>
      </div>
    </ResizableSplitLayout>
  );
};

DefaultTemplate.propTypes = {
  theme: PropTypes.string.isRequired,
  maxNumOfFrames: PropTypes.number.isRequired,
  maxNumOfHistories: PropTypes.number.isRequired,
  maxDataOfGraph: PropTypes.number.isRequired,
  maxDataOfTable: PropTypes.number.isRequired,
  changeSettings: PropTypes.func.isRequired,
};

export default DefaultTemplate;
