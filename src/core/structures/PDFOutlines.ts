import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFString from 'src/core/objects/PDFString';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import { InvalidTargetIndexError } from 'src/core/errors';


export type OutlineNode = PDFOutlines;

export interface outlineOptions {
  expanded?: boolean,
  linkToPage?: number,
}

class PDFOutlines extends PDFDict {
  static withContext = (
    context: PDFContext,
    options?: outlineOptions,
    title?: string,
    parent?: PDFRef,
  ) => {
    const dict = new Map();
    if (!parent) {
      dict.set(PDFName.Type, PDFName.Outlines);
    } else {
      dict.set(PDFName.Title, title ? PDFString.of(title) : title);
      dict.set(PDFName.Parent, parent);
      dict.set(PDFName.Count, context.obj(0));
    }
    dict.set(PDFName.Count, context.obj(0));
    return new PDFOutlines(dict, context, options);
  };

  static fromMapWithContext = (
    map: DictMap,
    context: PDFContext,
    options?: outlineOptions,
  ) => new PDFOutlines(map, context, options);

  readonly children: Array<PDFRef>;
  private readonly options: outlineOptions;

  protected constructor(
    map: DictMap,
    context: PDFContext,
    options: outlineOptions = { expanded: false },
  ) {
    super(map, context);
    this.children = [];
    this.options = options;
  }

  getPageRef() {
    return true;
  }

  Parent(): PDFOutlines {
    return this.lookupMaybe(PDFName.Parent, PDFDict) as PDFOutlines;
  }

  Count(): PDFNumber {
    return this.lookup(PDFName.Count, PDFNumber);
  }

  setParent(parentRef: PDFRef): void {
    this.set(PDFName.Parent, parentRef);
  }

  setDest(dest: PDFRef): void {
    this.set(PDFName.Dest, this.context.obj([dest, PDFName.Fit]));
  }

  pushOutlineItem(outlineRef: PDFRef): void {
    this.children.push(outlineRef);
  }

  /**
   * Inserts the given ref of an outlines node as a child of this PDFOutlines node at the
   * specified index (zero-based). Also increments the `Count` of each outlines node in the
   * hierarchy to accomodate the new outlines.
   *
   * Returns the ref of the inserted PDFOutlines node.
   */
  insertOutlineItem(
    parentRef: PDFRef,
    outlineRef: PDFRef,
    targetIndex: number,
  ): PDFRef {
    if (targetIndex > this.children.length || targetIndex < 0) {
      throw new InvalidTargetIndexError(targetIndex, this.children.length);
    }
    this.children.splice(targetIndex, 0, outlineRef);
    const newCount = this.Count().asNumber() + 1;
    this.set(PDFName.Count, PDFNumber.of(newCount));

    return parentRef;
  }

  /** Performs a Post-Order traversal of this outlines */
  traverse(visitor: (node: PDFOutlines, ref: PDFRef) => any): void {
    const children = this.children;
    for (let idx = 0, len = children.length; idx < len; idx++) {
      const childRef = children[idx] as PDFRef;
      const child = this.context.lookup(childRef) as PDFOutlines;
      if (child.children.length) child.traverse(visitor);
      visitor(child, childRef);
    }
  }

  /** Performs a cleanup before Save
   * assigns First, Last, Prev and Next and also updates Count,
   * which is calculated differently than how Pages get calculated
   * (12.3.3 Table 152)
   *
   * Heavily inspired by PSDKit: https://github.com/foliojs/pdfkit
   */
  endOutline(): number {
    let childrenCount = 0;
    if (this.children.length > 0) {
      const first = this.children[0];
      const last = this.children[this.children.length - 1];
      this.set(PDFName.First, first);
      this.set(PDFName.Last, last);

      for (let i = 0, len = this.children.length; i < len; i++) {
        const childRef = this.children[i] as PDFRef;
        const child = this.context.lookup(childRef) as PDFOutlines;
        if (i > 0) {
          child.set(PDFName.Prev, this.children[i - 1]);
        }
        if (i < this.children.length - 1) {
          child.set(PDFName.Next, this.children[i + 1]);
        }
        childrenCount += child.endOutline();
      }
    }
    if (this.options?.expanded) {
      this.set(
        PDFName.Count,
        PDFNumber.of(this.children.length + childrenCount),
      );
    }
    return this.options?.expanded ? this.children.length : 0;
  }
}

export default PDFOutlines;
