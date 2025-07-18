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
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import ReactDOMServer from 'react-dom/server';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure Bootstrap styles are imported
import PropTypes from 'prop-types';
import cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import klay from 'cytoscape-klay';
import euler from 'cytoscape-euler';
import avsdf from 'cytoscape-avsdf';
import spread from 'cytoscape-spread';
import CytoscapeComponent from 'react-cytoscapejs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEyeSlash,
  faLockOpen,
  faProjectDiagram,
  faWindowClose,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import cxtmenu from '../../lib/cytoscape-cxtmenu-bitnine';
import { initLocation, seletableLayouts } from './CytoscapeLayouts';
import { stylesheet } from './CytoscapeStyleSheet';
import { generateCytoscapeElement } from '../../features/cypher/CypherUtil';
import styles from '../frame/Frame.module.scss';

cytoscape.use(COSEBilkent);
cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(klay);
cytoscape.use(euler);
cytoscape.use(avsdf);
cytoscape.use(spread);
cytoscape.use(cxtmenu);

const CypherResultCytoscapeCharts = ({
  elements, cytoscapeObject, setCytoscapeObject, cytoscapeLayout, maxDataOfGraph,
  onElementsMouseover, addLegendData,
}) => {
  const [cytoscapeMenu, setCytoscapeMenu] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleClose = () => setShowModal(false);

  const addEventOnElements = (targetElements) => {
    targetElements.bind('mouseover', (e) => {
      onElementsMouseover({ type: 'elements', data: e.target.data() });
      e.target.addClass('highlight');
    });

    targetElements.bind('mouseout', (e) => {
      if (cytoscapeObject.elements(':selected').length === 0) {
        onElementsMouseover({
          type: 'background',
          data: {
            nodeCount: cytoscapeObject.nodes().size(),
            edgeCount: cytoscapeObject.edges().size(),
          },
        });
      } else {
        onElementsMouseover({
          type: 'elements',
          data: cytoscapeObject.elements(':selected')[0].data(),
        });
      }

      e.target.removeClass('highlight');
    });

    targetElements.bind('click', (e) => {
      const ele = e.target;
      if (ele.selected() && ele.isNode()) {
        if (cytoscapeObject.nodes(':selected').size() === 1) {
          ele.neighborhood().selectify().select().unselectify();
        } else {
          cytoscapeObject.nodes(':selected').filter(`[id != "${ele.id()}"]`).neighborhood().selectify()
            .select()
            .unselectify();
        }
      } else {
        cytoscapeObject.elements(':selected').unselect().selectify();
      }
    });

    cytoscapeObject.bind('click', (e) => {
      if (e.target === cytoscapeObject) {
        cytoscapeObject.elements(':selected').unselect().selectify();
        onElementsMouseover({
          type: 'background',
          data: {
            nodeCount: cytoscapeObject.nodes().size(),
            edgeCount: cytoscapeObject.edges().size(),
          },
        });
      }
    });
  };

  const addElements = (centerId, d) => {
    const generatedData = generateCytoscapeElement(d.rows, maxDataOfGraph, true);
    if (generatedData.elements.nodes.length === 0) {
      setModalMessage('No data to extend.');
      setShowModal(true);
      // alert('No data to extend.');
      return;
    }

    cytoscapeObject.elements().lock();
    cytoscapeObject.add(generatedData.elements);

    const newlyAddedEdges = cytoscapeObject.edges('.new');
    const newlyAddedTargets = newlyAddedEdges.targets();
    const newlyAddedSources = newlyAddedEdges.sources();
    const rerenderTargets = newlyAddedEdges.union(newlyAddedTargets).union(newlyAddedSources);

    const centerPosition = { ...cytoscapeObject.nodes().getElementById(centerId).position() };
    cytoscapeObject.elements().unlock();
    rerenderTargets.layout(seletableLayouts.concentric).run();

    const centerMovedPosition = { ...cytoscapeObject.nodes().getElementById(centerId).position() };
    const xGap = centerMovedPosition.x - centerPosition.x;
    const yGap = centerMovedPosition.y - centerPosition.y;
    rerenderTargets.forEach((ele) => {
      const pos = ele.position();
      ele.position({ x: pos.x - xGap, y: pos.y - yGap });
    });
    addEventOnElements(cytoscapeObject.elements('new'));

    addLegendData(generatedData.legend);
    rerenderTargets.removeClass('new');
  };

  const handleZoomIn = () => {
    if (cytoscapeObject) {
      const currentZoom = cytoscapeObject.zoom();
      const newZoom = currentZoom * 1.3;

      cytoscapeObject.animate(
        {
          zoom: newZoom,
          center: { eles: cytoscapeObject.elements() },
        },
        {
          duration: 100,
          easing: 'ease-in-out',
        },
      );
    }
  };

  const handleZoomOut = () => {
    if (cytoscapeObject) {
      const currentZoom = cytoscapeObject.zoom();
      const newZoom = currentZoom * 0.7;

      cytoscapeObject.animate(
        {
          zoom: newZoom,
          center: { eles: cytoscapeObject.elements() },
        },
        {
          duration: 100,
          easing: 'ease-in-out',
        },
      );
    }
  };
  useEffect(() => {
    if (cytoscapeMenu === null && cytoscapeObject !== null) {
      const cxtMenuConf = {
        menuRadius(ele) {
          return ele.cy().zoom() <= 1 ? 55 : 70;
        },
        selector: 'node',
        commands: [
          {
            content: ReactDOMServer.renderToString(
              (<FontAwesomeIcon icon={faLockOpen} size="lg" />),
            ),
            select(ele) {
              ele.animate({ position: initLocation[ele.id()] });
            },
          },
          {
            content: ReactDOMServer.renderToString(
              (<FontAwesomeIcon icon={faProjectDiagram} size="lg" />),
            ),
            select(ele) {
              fetch('/api/v1/cypher',
                {
                  method: 'POST',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ cmd: `MATCH (S)-[R]-(T) WHERE id(S) = '${ele.id()}' RETURN S, R, T` }),
                })
                .then((res) => res.json())
                .then((data) => {
                  addElements(ele.id(), data);
                });
            },
          },

          {
            content: ReactDOMServer.renderToString(
              (<FontAwesomeIcon icon={faEyeSlash} size="lg" />),
            ),
            select(ele) {
              ele.remove();
            },
          },

          {
            content: ReactDOMServer.renderToString(
              (<FontAwesomeIcon icon={faWindowClose} size="lg" />),
            ),
            select() {
            },
          },
        ],
        fillColor: 'var(--menu-bg)',
        activeFillColor: 'var(--menu-active-bg)',
        activePadding: 0,
        indicatorSize: 0,
        separatorWidth: 4, /* might cause conflict in theme switcher */
        spotlightPadding: 3,
        minSpotlightRadius: 11,
        maxSpotlightRadius: 99,
        openMenuEvents: 'cxttap',
        itemColor: 'var(--menu-item-color)',
        itemTextShadowColor: 'transparent', /* might cause conflict in theme switcher */
        zIndex: 9999,
        atMouse: false,
      };
      setCytoscapeMenu(cytoscapeObject.cxtmenu(cxtMenuConf));
    }
  }, [cytoscapeObject, cytoscapeMenu]);

  useEffect(() => {
    if (cytoscapeLayout && cytoscapeObject) {
      const selectedLayout = seletableLayouts[cytoscapeLayout];
      selectedLayout.animate = true;
      selectedLayout.fit = true;

      cytoscapeObject.minZoom(1e-1);
      cytoscapeObject.maxZoom(1.5);
      cytoscapeObject.layout(selectedLayout).run();
      cytoscapeObject.maxZoom(5);
      if (!initialized) {
        addEventOnElements(cytoscapeObject.elements());
        setInitialized(true);
      }
    }
  }, [cytoscapeObject, cytoscapeLayout]);
  const cyRef = useRef(null);
  const cyCallback = useCallback((cy) => {
    if (!cyRef.current) {
      cyRef.current = cy;
    }
    if (!cytoscapeObject) {
      setCytoscapeObject(cy);
    }
  }, [cytoscapeObject]);
  const handleFitView = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  };
  const handleExportGraph = () => {
    if (cyRef.current) {
      const pngData = cyRef.current.png({
        full: true,
        bg: '#ffffff',
        scale: 2, // high resolution
      });

      // Create a link and trigger the download
      const link = document.createElement('a');
      link.href = pngData;
      link.download = 'graph-export.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <CytoscapeComponent
        elements={CytoscapeComponent.normalizeElements(elements)}
        stylesheet={stylesheet}
        cy={cyCallback}
        className={styles.NormalChart}
        wheelSensitivity={0.3}
      />
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className={styles.zoomControls}>
        <Button className={styles.zoomButton} onClick={handleFitView}>
          ⛶
        </Button>
        <Button className={styles.zoomButton} onClick={handleZoomIn}>
          +
        </Button>
        <Button className={styles.zoomButton} onClick={handleZoomOut}>
          -
        </Button>
        <Button className={styles.zoomButton} onClick={handleExportGraph}>
          <FontAwesomeIcon icon={faDownload} />
        </Button>
      </div>
    </div>
  );
};

CypherResultCytoscapeCharts.defaultProps = {
  cytoscapeObject: null,
};

CypherResultCytoscapeCharts.propTypes = {
  elements: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.shape({
      // eslint-disable-next-line react/forbid-prop-types
      data: PropTypes.any,
    })),
    edges: PropTypes.arrayOf(PropTypes.shape({
      // eslint-disable-next-line react/forbid-prop-types
      data: PropTypes.any,
    })),
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  cytoscapeObject: PropTypes.any,
  setCytoscapeObject: PropTypes.func.isRequired,
  cytoscapeLayout: PropTypes.string.isRequired,
  maxDataOfGraph: PropTypes.number.isRequired,
  onElementsMouseover: PropTypes.func.isRequired,
  addLegendData: PropTypes.func.isRequired,
};

export default CypherResultCytoscapeCharts;
