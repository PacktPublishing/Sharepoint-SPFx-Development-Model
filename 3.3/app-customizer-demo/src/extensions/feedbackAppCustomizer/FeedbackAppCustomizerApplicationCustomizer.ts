import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, Placeholder
} from '@microsoft/sp-application-base';

import * as strings from 'feedbackAppCustomizerStrings';
import { escape } from '@microsoft/sp-lodash-subset'; 
const styles = require('./stylesheets.css');

const LOG_SOURCE: string = 'FeedbackAppCustomizerApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFeedbackAppCustomizerApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class FeedbackAppCustomizerApplicationCustomizer
  extends BaseApplicationCustomizer<IFeedbackAppCustomizerApplicationCustomizerProperties> {

  // custom variable
  private headerPlaceholder: Placeholder;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    return Promise.resolve<void>();
  }

  @override
  public onRender(): void {
    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
    }

    // Handling the header placeholder
    if (!this.headerPlaceholder) {
      this.headerPlaceholder = this.context.placeholders.tryAttach(
        'PageHeader',
        {
          onDispose: this.onDisposeHeader
        });

      // The extension should not assume that the expected placeholder is available.
      if (!this.headerPlaceholder) {
        console.error('The expected placeholder (PageHeader) was not found.');
        return;
      }

      if (this.properties) {
        let headerString = '(Header property was not defined.)';
        if (this.headerPlaceholder.domElement) {
          this.headerPlaceholder.domElement.innerHTML = `
                <div class="nothing">
                  <div class="ms-bgColor-themeDark ms-fontColor-white">
                    <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> ${escape(headerString)}
                  </div>
                </div>`;
          
          this.headerPlaceholder.domElement.innerHTML += '<div id="feedback">\
		<div id="feedback-form" style=\'display:none;\' class="col-xs-4 col-md-4 panel panel-default">\
			<form method="POST" class="form panel-body" role="form">\
				<div class="form-group">\
					<input class="form-control" name="title" required autofocus placeholder="Title of feedback" type="text" />\
				</div>\
				<div class="form-group">\
                    Area:\
					<select id="feedbackAreaSelect" class="form-control" name="area" required></select>\
				</div>\
				<div class="form-group">\
					<textarea class="form-control" name="body" required placeholder="Please write your feedback here..." rows="5"></textarea>\
				</div>\
				<button class="btn btn-primary pull-right" type="submit">Send</button>\
			</form>\
		</div>\
		<div id="feedback-tab">Feedback</div>\
  </div>';

          let tab = document.getElementById("feedback-tab");
          let form = document.getElementById("feedback-form");
          tab.addEventListener('click', ()  => {
              if (form.style.display == 'none') {
                form.style.display = 'block';
              } else {
                form.style.display = 'none';
              }
          });
        }
      }
    }

    //alert(`Hello from ${strings.Title}:\n\n${message}`);
  }

  private onDisposeHeader(): void {
    console.log('Disposed custom header.');
  }
}
