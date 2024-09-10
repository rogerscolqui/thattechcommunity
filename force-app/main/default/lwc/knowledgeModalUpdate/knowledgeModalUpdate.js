import { api, LightningElement } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import updateKnowledgeArticle from "@salesforce/apex/KnowledgeController.updateKnowledgeArticle";

export default class KnowledgeModalUpdate extends LightningElement {

    updateRecord = true;
    showModal = false

    closeModal() {
        this.showModal = false;
    }

    @api
    openModal() {
        this.showModal = true;
    }

    @api
    knowledgeDetail;

    handleUpdateKnowledgeButton() {
        this.handleStatusModal("loading");
        this.isLoading = true;

        // const { kaTitle, kaUrlName, kaBody, kaBannerImage, kaTopicId, kaId } = this.knowledgeDetail;

        // let kaDetail = {
        //     title : kaTitle, 
        //     urlName : kaUrlName, 
        //     body : kaBody, 
        //     bannerImage : kaBannerImage, 
        //     topicId : kaTopicId,
        //     kaId : kaId
        // };

        // updateKnowledgeArticle(kaDetail)
        // .then((result) => {
        //     console.log(result);
        //     const evt = new ShowToastEvent({
        //         title: 'Success',
        //         message: 'Record was successfully updated ',
        //         variant: 'success',
        //       });
        //     this.dispatchEvent(evt);
        //     this.closeModal();
        //     this.handleStatusModal("finished");
        // }).catch(error => {
        //     console.info(error);
        //     const evt = new ShowToastEvent({
        //         title: 'Error',
        //         message: 'There was a problem updating the article. Please contact us',
        //         variant: 'success',
        //       });
        //       this.dispatchEvent(evt);
        //       this.handleStatusModal("finished");
        // })
    }

    handleStatusModal(status){
        const evtM =  new CustomEvent("modalstatus", {
            detail: {
                status: status
            }
        })
        this.dispatchEvent(evtM) 
        this.closeModal();
    }

    handleKnowledgeFormStatus(event){
        let knowledgeFormStatus = event.detail.status;
        this.handleStatusModal(knowledgeFormStatus);
    }
}