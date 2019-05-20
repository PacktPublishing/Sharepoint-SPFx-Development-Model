import pnp, { Web, List, ListEnsureResult, ItemAddResult } from "sp-pnp-js";
import * as ko from 'knockout';
import styles from './SpFxKoFeedback.module.scss';
import { ISpFxKoFeedbackWebPartProps } from './ISpFxKoFeedbackWebPartProps';
import { IWebPartContext } from '@microsoft/sp-webpart-base';

export interface ISpFxKoFeedbackBindingContext extends ISpFxKoFeedbackWebPartProps {
  shouter: KnockoutSubscribable<{}>;
  spFxContext: IWebPartContext;
}

export interface AreaListItem {
  Id: number;
  Title: string;
}

export interface FeedbackListItem {
  Id: number;
  Title: string;
  Area: AreaListItem;
  Message: string;
}

export default class SpFxKoFeedbackViewModel {
  public currentWeb: Web = null;
  public description: KnockoutObservable<string> = ko.observable('');
  public newFeedbackTitle: KnockoutObservable<string> = ko.observable('');
  public newFeedbackMessage: KnockoutObservable<string> = ko.observable('');
  public newFeedbackAreaId: KnockoutObservable<AreaListItem> = ko.observable(null);
  public feedbackItems: KnockoutObservableArray<FeedbackListItem> = ko.observableArray([]);
  public areaItems: KnockoutObservableArray<AreaListItem> = ko.observableArray([]);

  public labelClass: string = styles.label;
  public spFxKoFeedbackClass: string = styles.spFxKoFeedback;
  public containerClass: string = styles.container;
  public rowClass: string = `ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`;
  public buttonClass: string = `ms-Button ${styles.button}`;

  constructor(bindings: ISpFxKoFeedbackBindingContext) {
    this.description(bindings.description);
    this.currentWeb = new Web(bindings.spFxContext.pageContext.web.absoluteUrl);

    // When web part description is updated, change this view model's description.
    bindings.shouter.subscribe((value: string) => {
      this.description(value);
    }, this, 'description');

    // Load area items
    this.getAreaItems().then(items => {
      this.areaItems(items);
    });

    // Load feedback items
    this.getFeedbackItems().then(items => {
      this.feedbackItems(items);
    });
  }

  private getFeedbackItems(): Promise<FeedbackListItem[]> {
    //return pnp.sp.web
    return this.currentWeb
        .lists
        .getByTitle("Feedback Tracker").items
        .select("Id", "Title", "Area/Title", "Area/Id", "Message")
        .expand("Area").getAs<FeedbackListItem[]>();
  }

  private getAreaItems(): Promise<AreaListItem[]> {
    //return pnp.sp.web
    return this.currentWeb
        .lists
        .getByTitle("Areas").items
        .select("Id", "Title").getAs<AreaListItem[]>();
  }

  public addFeedbackItem(): void {
    if (this.newFeedbackTitle() !== "" && this.newFeedbackMessage() !== "") {
      this.getFeedbackList().then(list => {
        // Add the new item to the SharePoint list
        list.items.add({
          Title: this.newFeedbackTitle(),
          Message: this.newFeedbackMessage(),
          AreaId: this.newFeedbackAreaId().Id
        }).then((iar: ItemAddResult) => {
          // Add the new item to the display
          this.feedbackItems.push({
            Id: iar.data.Id,
            Message: iar.data.Message,
            Title: iar.data.Title,
            Area: this.areaItems().filter(item => item.Id == iar.data.AreaId)[0]
          });

          // Clear the form
          this.newFeedbackTitle("");
          this.newFeedbackMessage("");
          this.newFeedbackAreaId(null);
        });
      });
    }
  }

  public deleteFeedbackItem(data): void {
    if (confirm("Are you sure you want to delete this item?")) {
      this.getFeedbackList().then(list => {
        list.items.getById(data.Id).delete().then(_ => {
          this.feedbackItems.remove(data);
        });
      }).catch((e: Error) => {
        alert(`There was an error deleting the item: ${e.message}`);
      });
    }
  }

  private getFeedbackList(): Promise<List> {
    return new Promise<List>((resolve, reject) => {
      //pnp.sp.web
      this.currentWeb
      .lists.ensure("Feedback Tracker").then((ler: ListEnsureResult) => {
        if (!ler.created) {
          resolve(ler.list);
        }
      }).catch(e => reject(e));
    });
  }
}
