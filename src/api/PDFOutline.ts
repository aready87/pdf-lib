import PDFDocument from 'src/api/PDFDocument';
import {
  PDFOutlines,
  outlineOptions,
  PDFRef,
} from 'src/core';
import {
  assertIs,
  assertRange,
} from 'src/utils';

/**
 * Represents a single outline of a [[PDFDocument]].
 */
export default class PDFOutline {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.addOutline]] and [[PDFDocument.insertOutline]]
   * > methods, which can create instances of [[PDFOutline]] for you.
   *
   * Create an instance of [[PDFOutline]] from an existing leaf node.
   *
   * @param outlineNode The outline node to be wrapped.
   * @param ref The unique reference for the outline.
   * @param doc The document to which the outline will belong.
   */
  static of = (outlineNode: PDFOutlines, ref: PDFRef, doc: PDFDocument) =>
    new PDFOutline(outlineNode, ref, doc);

  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.addOutline]] and [[PDFDocument.insertOutline]]
   * > methods, which can create instances of [[PDFOutline]] for you.
   *
   * Create an instance of [[PDFOutline]].
   *
   * @param doc The document to which the outline will belong.
   */
  static create = (doc: PDFDocument, title: string, options?: outlineOptions) => {
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
    const dummyRef = PDFRef.of(-1);
    const outlineItem = PDFOutlines.withContext(
      doc.context,
      options,
      title,
      dummyRef,
    );
 
    const outlineRef = doc.context.register(outlineItem);
    return new PDFOutline(outlineItem, outlineRef, doc);
  };

  /** The low-level PDFDictionary wrapped by this page. */
  readonly node: PDFOutlines;

  /** The unique reference assigned to this page within the document. */
  readonly ref: PDFRef;

  /** The document to which this page belongs. */
  readonly doc: PDFDocument;


  private constructor(outlineNode: PDFOutlines, ref: PDFRef, doc: PDFDocument) {
    // assertIs(outlineNode, 'outlineNode', [[PDFOutlines, 'PDFOutlines']]);
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.node = outlineNode;
    this.ref = ref;
    this.doc = doc;
  }


  /**
   * Add a outlineItem as a child to the end of this outlineItem. This method accepts
   * three prameters:
   * 1) title, as a text string, 2) expanded, a boolean, and 3) Dest, a page reference to link:
   *
   *
   * For example:
   * ```js
   * const newPage = pdfDoc.addPage()
   * const newOutline = pdfDoc.addOutline('title')
   * const childOutline = newOutline.addOutline('title2')
   * ```
   *
   * @param title The desired title of the outline.
   * @param options Optionally, boolean of whether you want the outline to be expanded.
   * @returns The newly created outline.
   */
  addOutline(title: string, options?: outlineOptions): PDFOutline {
    assertIs(title, 'title', ['string']);
    if (options?.expanded) assertIs(options?.expanded, 'expanded', ['boolean']);
    if (options?.linkToPage)
      assertRange(options?.linkToPage, 'linkToPage', 0, this.doc.getPageCount());
    return this.insertOutline(this.node.children.length, title, options);
  }

  /**
   * Add a outlineItem as a child at the index of this outlineItem.
   * This method accepts three prameters:
   * 1) index, number where to insert, 2) title, as a text string,
   * 3) expanded, a boolean, and 4) Dest, a page reference to link:
   *
   *
   * For example to insert outline as the third outline:
   * ```js
   * const newPage = pdfDoc.addPage()
   * const newOutline = pdfDoc.addOutline('title')
   * const childOutline = newOutline.addOutline(2, 'title2')
   * ```
   *
   * @param index The index at which the page should be inserted (zero-based).
   * @param title The desired title of the outline.
   * @returns The newly created outline.
   */
  insertOutline(index: number, title: string, options?: outlineOptions): PDFOutline {
    const outlineCount = this.node.children.length;
    assertRange(index, 'index', 0, outlineCount);
    assertIs(title, 'title', ['string']);
    if (options?.expanded) assertIs(options?.expanded, 'expanded', ['boolean']);
    if (options?.linkToPage)
      assertRange(options?.linkToPage, 'linkToPage', 0, this.doc.getPageCount());

    const outline = PDFOutline.create(this.doc, title, options);
    const parentRef = this.node.insertOutlineItem(this.ref, outline.ref, index);
    outline.node.setParent(parentRef);

    if (options?.linkToPage) {
      const page = this.doc.getPage(options?.linkToPage);
      outline.node.setDest(page.ref);
    }

    return outline;
  }


}
