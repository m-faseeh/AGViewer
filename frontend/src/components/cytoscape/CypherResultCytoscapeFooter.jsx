/*
 * Copyright 2025 SKAI Worldwide Co., Ltd.
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';
import uuid from 'react-uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import {
  updateEdgeLabelSize,
  updateLabelCaption,
  updateLabelColor,
  updateNodeLabelSize,
  nodeLabelIcons,
  updateLabelIcon,
  applyNodeIconToCytoscape,
} from '../../features/cypher/CypherUtil';
import CytoscapeLayoutDropdown from './CytoscapeLayoutDropdown';

const CypherResultCytoscapeFooter = ({
  cy,
  footerData,
  edgeLabelColors,
  nodeLabelColors,
  nodeLabelSizes,
  edgeLabelSizes,
  colorChange,
  sizeChange,
  captionChange,
  selectedCaption,
  captions,
  setCytoscapeLayout,
  cytoscapeLayout,
}) => {
  const [footerExpanded, setFooterExpanded] = useState(false);
  const extractData = (d) => {
    const extractedData = [];
    for (let i = 0; i < Object.entries(d).length; i += 1) {
      const [alias, val] = Object.entries(d)[i];
      extractedData.push(
        <span key={uuid()} className="label">
          <strong className="pl-3">
            {alias}
            {' '}
            :
            {' '}
          </strong>
          {' '}
          {typeof val === 'object' ? JSON.stringify(val) : val}
        </span>,
      );
    }
    return extractedData;
  };

  const displayFooterData = () => {
    if (footerData.type === 'elements') {
      const isEdge = footerData.data.source;

      return (
        <div className="d-flex pl-3">
          <div className={`mr-auto graphFrameFooter ${footerExpanded ? 'expandedGraphFrameFooter' : ''}`}>
            <Badge
              className="px-3 py-1"
              pill={isEdge === false}
              style={{
                backgroundColor: footerData.data.backgroundColor,
                color: footerData.data.fontColor,
              }}
            >
              {footerData.data.label}
            </Badge>
            <span className="label">
              <strong className="pl-3">&lt;gid&gt; : </strong>
              {' '}
              {footerData.data.id}
            </span>
            {extractData(footerData.data.properties)}
          </div>
          <button
            type="button"
            className="frame-head-button btn btn-link px-3"
            aria-label="Expand Footer"
            onClick={() => setFooterExpanded(!footerExpanded)}
          >
            <FontAwesomeIcon
              icon={footerExpanded ? faAngleUp : faAngleDown}
              style={{ color: 'gray' }}
            />
          </button>
          Layout :&nbsp;
          <CytoscapeLayoutDropdown
            selectedLayout={cytoscapeLayout}
            onChange={setCytoscapeLayout}
            id="selectLayout"
            className="col-2"
          />
        </div>
      );
    }
    if (footerData.type === 'background') {
      return (
        <div className="d-flex pl-3">
          <div className="mr-auto label pl-3">
            Displaying&nbsp;
            <strong>{footerData.data.nodeCount}</strong>
            &nbsp;
            nodes,&nbsp;
            <strong>{footerData.data.edgeCount}</strong>
            {' '}
            edges
          </div>
          Layout :&nbsp;
          <CytoscapeLayoutDropdown
            selectedLayout={cytoscapeLayout}
            onChange={setCytoscapeLayout}
            id="selectLayout"
            className="col-2"
          />
        </div>
      );
    }
    if (footerData.type === 'labels') {
      const isEdge = footerData.data.type === 'edge';

      const nodeSizeButton = (nodeSize, i) => {
        const size = (i * 3) + 12;
        return (
          <button
            onClick={() => [updateNodeLabelSize(footerData.data.label, nodeSize),
              sizeChange(footerData.data.type, footerData.data.label, nodeSize)]}
            key={uuid()}
            type="button"
            className={`btn sizeSelector node ${footerData.data.size >= nodeSize ? ' selectedSize ' : ''}`}
            style={{ width: `${size}px`, height: `${size}px` }}
            aria-label="Size selector"
          >
            &nbsp;
          </button>
        );
      };

      const edgeSizeButton = (edgeSize, i) => {
        const size = (i * 3) + 12;
        return (
          <button
            onClick={() => [updateEdgeLabelSize(footerData.data.label, edgeSize),
              sizeChange(footerData.data.type, footerData.data.label, edgeSize)]}
            key={uuid()}
            type="button"
            className={`btn sizeSelector edge ${footerData.data.size >= edgeSize ? ' selectedSize ' : ''}`}
            style={{ width: `${size + 18}px`, height: `${size}px` }}
            aria-label="Change edge size"
          >
            &nbsp;
          </button>
        );
      };

      const generateButton = () => {
        if (footerData.data.type === 'node') {
          return nodeLabelSizes.map((labelSize, i) => nodeSizeButton(labelSize.size, i));
        }
        if (footerData.data.type === 'edge') {
          return edgeLabelSizes.map((labelSize, i) => edgeSizeButton(labelSize.size, i));
        }
        return null;
      };
      const generateColors = () => {
        if (footerData.data.type === 'node') {
          return nodeLabelColors.map((color) => (
            <button
              onClick={() => [
                updateLabelColor(footerData.data.type, footerData.data.label, color),
                colorChange(footerData.data.type, footerData.data.label, color)]}
              key={uuid()}
              type="button"
              className={`btn colorSelector ${footerData.data.backgroundColor === color.color ? ' selectedColor ' : ''}`}
              style={{ backgroundColor: color.color }}
              aria-label="Change node label color"
            >
              &nbsp;
            </button>
          ));
        }
        if (footerData.data.type === 'edge') {
          return edgeLabelColors.map((color) => (
            <button
              onClick={() => [
                updateLabelColor(footerData.data.type, footerData.data.label, color),
                colorChange(footerData.data.type, footerData.data.label, color)]}
              key={uuid()}
              type="button"
              className={`btn colorSelector ${footerData.data.backgroundColor === color.color ? ' selectedColor ' : ''}`}
              style={{ backgroundColor: color.color }}
              aria-label="Change edge label color"
            >
              &nbsp;
            </button>
          ));
        }
        return null;
      };
      const generateIcons = () => {
        if (footerData.data.type !== 'node') return null;

        return Object.entries(nodeLabelIcons).map(([label, icon]) => (
          <button
            key={label}
            onClick={() => {
              updateLabelIcon(footerData.data.label, icon); // 👈 we'll define this
              applyNodeIconToCytoscape(cy, footerData.data.label, icon);
            }}
            type="button"
            className="btn iconSelector"
            style={{
              padding: '4px',
              margin: '0 4px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
            }}
            aria-label={`Select ${label} icon`}
          >
            <FontAwesomeIcon icon={icon} />
          </button>
        ));
      };

      return (
        <div className="d-flex pl-3">
          <div className={`mr-auto graphFrameFooter ${footerExpanded ? 'expandedGraphFrameFooter' : ''}`}>
            <Badge
              className="px-3 py-1"
              pill={isEdge === false}
              style={{
                backgroundColor: footerData.data.backgroundColor,
                color: footerData.data.fontColor,
              }}
            >
              {footerData.data.label}
            </Badge>
            <span className="label">
              <span className="pl-3">Color : </span>
              {generateColors()}
            </span>
            <span className="label">
              <span className="pl-3">Size : </span>
              {generateButton()}
            </span>
            <span className="label">
              <span className="pl-3">Icon : </span>
              {generateIcons()}
            </span>
            <span className="label">
              <span className="pl-3">Caption : </span>
              {captions.map((caption) => (
                <button
                  onClick={() => [
                    updateLabelCaption(footerData.data.type, footerData.data.label, caption),
                    captionChange(footerData.data.type, footerData.data.label, caption)]}
                  key={uuid()}
                  type="button"
                  className={`btn captionSelector ${selectedCaption === caption ? ' btn-secondary ' : ' btn-outline-dark '}`}
                >
                  <strong>
                    &lt;
                    {caption}
                    &gt;
                  </strong>
                </button>
              ))}
              <button
                onClick={() => [
                  updateLabelCaption(footerData.data.type, footerData.data.label, null),
                  captionChange(footerData.data.type, footerData.data.label, null)]}
                key={uuid()}
                type="button"
                className={`btn captionSelector ${selectedCaption === null ? ' btn-secondary ' : ' btn-outline-dark '}`}
              >
                <strong>
                  &lt;
                  &gt;
                </strong>
              </button>
            </span>
          </div>
          <button
            type="button"
            className="frame-head-button btn btn-link px-3"
            aria-label="expand footer"
            onClick={() => setFooterExpanded(!footerExpanded)}
          >
            <FontAwesomeIcon
              icon={footerExpanded ? faAngleUp : faAngleDown}
            />
          </button>
          Layout :&nbsp;
          <CytoscapeLayoutDropdown
            selectedLayout={cytoscapeLayout}
            onChange={setCytoscapeLayout}
            id="selectLayout"
            className="col-2"
          />
        </div>
      );
    }
    return (
      <div className="d-flex pl-3">
        <div className="mr-auto label pl-3" />
        <div className="px-1">Layout : </div>
        <CytoscapeLayoutDropdown
          selectedLayout={cytoscapeLayout}
          onChange={setCytoscapeLayout}
          id="selectLayout"
          className="col-2"
        />
      </div>
    );
  };

  return (
    <div className="chart-footer-area text-muted">
      {displayFooterData()}
    </div>
  );
};

CypherResultCytoscapeFooter.defaultProps = {
  selectedCaption: null,
};

CypherResultCytoscapeFooter.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  footerData: PropTypes.any.isRequired,
  edgeLabelColors: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    borderColor: PropTypes.string,
    fontColor: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    edgeLabels: PropTypes.any,
    index: PropTypes.number,
  })).isRequired,
  nodeLabelColors: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    borderColor: PropTypes.string,
    fontColor: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    nodeLabels: PropTypes.any,
    index: PropTypes.number,
  })).isRequired,
  nodeLabelSizes: PropTypes.arrayOf(PropTypes.shape({
    size: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    labels: PropTypes.any,
    index: PropTypes.number,
  })).isRequired,
  edgeLabelSizes: PropTypes.arrayOf(PropTypes.shape({
    size: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    labels: PropTypes.any,
    index: PropTypes.number,
  })).isRequired,
  colorChange: PropTypes.func.isRequired,
  sizeChange: PropTypes.func.isRequired,
  captionChange: PropTypes.func.isRequired,
  setCytoscapeLayout: PropTypes.func.isRequired,
  cytoscapeLayout: PropTypes.string.isRequired,
  selectedCaption: PropTypes.string,
  captions: PropTypes.arrayOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  cy: PropTypes.object.isRequired,
};

export default CypherResultCytoscapeFooter;
