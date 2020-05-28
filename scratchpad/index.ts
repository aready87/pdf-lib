import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.create({ useOutlines: true });

  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  
  pdfDoc.addOutline('First Outline', { expanded: true, linkToPage: 1 });
  const outline = pdfDoc.addOutline('Second Outline', {
    expanded: true,
    linkToPage: 1,
  });
  const suboutline = outline.addOutline('Child of Second', {
    expanded: true,
    linkToPage: 2,
  });
  suboutline.addOutline('Grandchild of Second', { expanded: true, linkToPage: 6 });

  pdfDoc.addOutline('Third', { expanded: true, linkToPage: 3 });
  pdfDoc.addOutline('Fourth', { expanded: true, linkToPage: 5 });

  const page = pdfDoc.addPage();

  const img = await pdfDoc.embedJpg(
    fs.readFileSync('assets/images/cmyk_colorspace.jpg'),
  );

  page.drawImage(img);

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
