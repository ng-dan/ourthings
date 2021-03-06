/** @module ourthings/Queueable/Templates */
import Queueable from "../Queueable";

/**
 * @classdesc
 *
 * Template manipulations
 *
 * @author Richard Reynolds richard@nautoguide.com
 *
 * @example
 * // @templates.render({"targetId":"content","template":"basic"});
 *
 */
class Templates extends Queueable {

	/**
	 * Render a template into the dom using the queues templateProcessor
	 * @param {number} pid - Process ID
	 * @param {object} json - queue arguments
	 * @param {string} json.template - dom id of template to use
	 * @param {string} [json.target] - dom id of render target
	 */
	render(pid,json) {
		let self=this;
		self.set(pid,json);
		if(!self.queue.templateProcessor(json.template,json.targetId))
			self.finished(pid,self.queue.DEFINE.FIN_ERROR,'Could not render template');
		else
			self.finished(pid,self.queue.DEFINE.FIN_OK);
	}
}

export default Templates;