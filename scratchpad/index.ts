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
  
  /* Declaration required for testing removing below */
  // const first = 
  pdfDoc.addOutline('First Outline', { expanded: true, linkToPage: 0 });
  const outline = pdfDoc.addOutline('Second Outline (page2)', {
    expanded: false,
    linkToPage: 1,
  });
  const suboutline = outline.addOutline('Child of Second (page3)', {
    expanded: true,
    linkToPage: 2,
  });
  suboutline.addOutline('Grandchild of Second (page4)', { expanded: true, linkToPage: 3 });
  outline.addOutline('Another Child of Second (page5)', {
    expanded: true,
    linkToPage: 4,
  });
  const thirdChild = outline.addOutline('3rd Child of Second (page5)', {
    expanded: false,
    linkToPage: 4,
  });
  thirdChild.addOutline('3rd`s progeny');
  outline.addOutline('4th Child of Second (page5)', {
    expanded: true,
    linkToPage: 4,
  });
  pdfDoc.addOutline('Third Outline (Page6)', { expanded: true, linkToPage: 5 });
  pdfDoc.addOutline('Fourth Outline (Page7)', { expanded: true, linkToPage: 6 });

  /* Testing editing: */
  // suboutline.setTitle('Changed title');
  // outline.linkToPage(7);
  // suboutline.setExpanded(false);

  /* Testing removing: */
  // suboutline.remove();
  // outline.remove();
  // first.remove();

  /**
   * Testing removing a page that an outline is linked to.
   * Outline will remain but link will not work as expected since 
   * Ref is pointed to a non-existent PDFObject.
   */
  // pdfDoc.removePage(1);

  const page = pdfDoc.addPage();

  const img = await pdfDoc.embedJpg(
    fs.readFileSync('assets/images/cmyk_colorspace.jpg'),
  );

  page.drawImage(img);

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
