// iconUtil.js

// FontAwesome imports
import {
  faBuilding,
  faUser,
  faEnvelope,
} from '@fortawesome/free-regular-svg-icons';
import {
  faSchool,
  faLocationArrow,
  faBook,
  faEnvelopeOpenText,
  faGlobe,
  faPhone,
  faSitemap,
} from '@fortawesome/free-solid-svg-icons';

// Map labels to icons
export const nodeLabelIcons = {
  // label: icon
  Person: faUser,
  Company: faBuilding,
  School: faSchool,
  Location: faLocationArrow,
  Book: faBook,
  Event: faEnvelopeOpenText,
  Email: faEnvelope,
  Website: faGlobe,
  Phone: faPhone,
  Organization: faSitemap,
};
// Helper function to convert FontAwesome icon to SVG data URL
export const iconToSvgDataUrl = (icon, color = '#000') => {
  if (!icon || !icon.icon) return null;
  const [width, height, , , svgPathData] = icon.icon;
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="${color}">
      <path d="${svgPathData}" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

// Generate Cytoscape style for a node icon
export const getNodeIconStyle = (iconDataUrl) => ({
  'background-image': iconDataUrl,
  'background-fit': 'none',
  'background-postion': 'center',
  //   'background-position-x': '50%',
  //   'background-position-y': '50%',
  'background-width': '60%',
  'background-height': '60%',
});
