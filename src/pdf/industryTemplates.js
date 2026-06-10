import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { wrapHtml } from './wrapHtml';

const INDUSTRY_TEMPLATE_MAP = {
  mechanics:            () => import('../pages/mechanics/TemplateSelector'),
  healthcare:           () => import('../pages/health/TemplateSelector'),
  health:               () => import('../pages/health/TemplateSelector'),
  security:             () => import('../pages/security/TemplateSelector'),
  electrical:           () => import('../pages/electrical/TemplateSelector'),
  restaurant:           () => import('../pages/restaurants/TemplateSelector'),
  restaurants:          () => import('../pages/restaurants/TemplateSelector'),
  construction:         () => import('../pages/construction/TemplateSelector'),
  cleaning:             () => import('../pages/cleaning/TemplateSelector'),
  education:            () => import('../pages/education/TemplateSelector'),
  hotel:                () => import('../pages/hotel/TemplateSelector'),
  legal:                () => import('../pages/legal/TemplateSelector'),
  plumbing:             () => import('../pages/plumbing/TemplateSelector'),
  retail:               () => import('../pages/retail/TemplateSelector'),
  landscaping:          () => import('../pages/landscaping/TemplateSelector'),
  logistics:            () => import('../pages/logistics/TemplateSelector'),
  photography:          () => import('../pages/photography/TemplateSelector'),
  realestate:           () => import('../pages/realestate/TemplateSelector'),
  flooring:             () => import('../pages/flooring/TemplateSelector'),
  hvac:                 () => import('../pages/hvac/TemplateSelector'),
  accounting:           () => import('../pages/accounting/TemplateSelector'),
  painting:             () => import('../pages/painting/TemplateSelector'),
  'pest-control':       () => import('../pages/pest-control/TemplateSelector'),
  'pool-services':      () => import('../pages/pool-services/TemplateSelector'),
  'solar-installation': () => import('../pages/solar-installation/TemplateSelector'),
  towing:               () => import('../pages/towing/TemplateSelector'),
  welding:              () => import('../pages/welding/TemplateSelector'),
  carpentry:            () => import('../pages/carpentry/TemplateSelector'),
  'window-repair':      () => import('../pages/window-repair/TemplateSelector'),
  technology:           () => import('../pages/technology/TemplateSelector'),
  upholstery:           () => import('../pages/upholstery/TemplateSelector'),
  'virtual-services':   () => import('../pages/virtual-services/TemplateSelector'),
  'appliance-repair':   () => import('../pages/appliance-repair/TemplateSelector'),
};

/**
 * @param {string} industry
 * @param {string} docType
 * @param {string} docNumber
 * @param {Record<string, any>} data
 * @returns {Promise<string>}
 */
export async function buildIndustryHTML(industry, docType, docNumber, data) {
  const importer = INDUSTRY_TEMPLATE_MAP[industry];
  if (!importer) throw new Error(`No template found for industry: ${industry}`);

  const module = await importer();
  const TemplateRenderer = module.TemplateRenderer;

  if (!TemplateRenderer) {
    throw new Error(`TemplateSelector for "${industry}" has no exported TemplateRenderer`);
  }

  const props = {
    ...data,
    templateId:    data.templateId    ?? 'professional',
    documentType:  docType,
    jobCardNumber: docNumber,
    invoiceNumber: docNumber,
    items:         data.items         ?? [],
    subtotal:      data.subtotal      ?? 0,
    vat:           data.vat           ?? 0,
    totalTax:      data.totalTax      ?? data.vat ?? 0,
    total:         data.total         ?? 0,
  };

  return wrapHtml(
    renderToStaticMarkup(<TemplateRenderer {...props} />)
  );
}