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
  
  // const first = 
  pdfDoc.addOutline('First Outline', { expanded: true, linkToPage: 1 });
  const outline = pdfDoc.addOutline('Second Outline (page2)', {
    expanded: true,
    linkToPage: 2,
  });
  const suboutline = outline.addOutline('Child of Second (page3)', {
    expanded: true,
    linkToPage: 3,
  });
  outline.addOutline('Child of Second (page5)', {
    expanded: true,
    linkToPage: 5,
  });
  suboutline.addOutline('Grandchild of Second (page4)', { expanded: true, linkToPage: 4 });

  pdfDoc.addOutline('Third Outline (Page6)', { expanded: true, linkToPage: 6 });
  pdfDoc.addOutline('Fourth Outline (Page7)', { expanded: true, linkToPage: 7 });

  suboutline.setTitle('Changed title');
  outline.linkToPage(7);
  suboutline.setExpanded(false);

  // suboutline.remove();
  // outline.remove();
  // first.remove();

  const page = pdfDoc.addPage();

  const img = await pdfDoc.embedJpg(
    fs.readFileSync('assets/images/cmyk_colorspace.jpg'),
  );

  page.drawImage(img);

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
