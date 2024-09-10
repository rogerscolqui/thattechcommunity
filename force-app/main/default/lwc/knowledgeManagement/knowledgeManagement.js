import { LightningElement, track, wire } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';
import { refreshApex } from '@salesforce/apex';

import getKnowledgeArticlesByUser from "@salesforce/apex/KnowledgeController.getKnowledgeArticlesByUser";
import submitKnowledgeArticleApproval from "@salesforce/apex/KnowledgeController.submitKnowledgeArticleApproval";
import deleteKnowledgeArticle from "@salesforce/apex/KnowledgeController.deleteKnowledgeArticle";

const columns = [
    {   label: 'Title', fieldName: 'Title', type: 'text'},
    {   label: 'Content', fieldName: 'Text__c', type: 'text'},
    {
        label: 'Article Status',
        type: 'button',
        fieldName: 'buttonName',
        typeAttributes: {
            value: {
                fieldName: 'buttonName'
            },
            label: {
                fieldName: 'buttonName'
            },
            title: {
                fieldName: 'buttonName'
            },
            disabled: {
                fieldName: 'buttonNameDisabled'
            },
            name: 'submitKa',
            variant: 'brand'
        }
    },
    {
        type:"button",
        // initialWidth: "100px",
        typeAttributes: {
            label: 'Edit',
            name: 'editKa',
            variant: 'brand'
        }
    },
    {
        type:"button",
        typeAttributes: {
            label: 'Delete',
            name: 'deleteKa',
            variant: 'brand'
        }
    }
];
// {label: '', fieldName: '', type: 'text', fixedWidth: 130},

export default class KnowledgeManagement extends LightningElement {

    @track kaRecords;
    kaColumns = columns;

    @track selectedKaId;
    @track selectedKaPublishStatus;
    @track selectedKaDetail;
    @track isLoading = false;

    @track
    isloadingUpdateModal = false

    @wire(getKnowledgeArticlesByUser, { UserId: ''})
    wiredGetKnowledgeArticlesByUser(value) {
        console.log('test');

        this.wiredKnowledgeArticlesByUser = value;    
        const { data, error } = value;

        if (data) { 
            // console.log('wired data',data)
            let kaRecordList = [];

            data.forEach(ka => {

                let btnPublishStatus = '';
                let btnPublishAction = false;

                if (ka.Approval_Status__c == 'Not Submitted' && ka.PublishStatus == 'Draft') {
                    btnPublishStatus = 'Submit for Review';
                    btnPublishAction = false;
                } else if (ka.Approval_Status__c == 'Submitted' && ka.PublishStatus == 'Draft') {
                    btnPublishStatus = 'Pending Approval';
                    btnPublishAction = true;
                } else if (ka.Approval_Status__c == 'Approved' && ka.PublishStatus == 'Online') {
                    btnPublishStatus = 'Published';
                    btnPublishAction = true;
                } else if (ka.Approval_Status__c == 'Approved' && ka.PublishStatus == 'Draft') {
                    btnPublishStatus = 'Couldn\'t Publish';
                    btnPublishAction = true;
                }

                kaRecordList.push({...ka, buttonName: btnPublishStatus, buttonNameDisabled: btnPublishAction});
            });
            this.kaRecords = kaRecordList;

            console.log(this.kaRecords);
        }
        else if (error) { 
            console.log(error);
        }
    }

    handleRowActionKa(event){
        this.selectedKaId = event.detail?.row?.Id;
        // console.log(this.selectedKaId);

        if (event.detail.action.name === 'submitKa') {
            this.handleSubmitKa();
        } else if (event.detail.action.name === 'editKa') {
            this.selectedKaPublishStatus = event.detail?.row?.PublishStatus;
            this.selectedKaDetail = event.detail?.row;
            this.handleEditKa();
        } else if (event.detail.action.name === 'deleteKa') {
            this.handleDeleteKa();
        }
    }

    handleSubmitKa(){
        console.log('submitted');
        submitKnowledgeArticleApproval({
            kaId: this.selectedKaId,
            UserId: '',
        })
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
    }

    handleEditKa(){
        // console.log(this.selectedKaPublishStatus); 
        console.log(this.selectedKaDetail);
        if (this.selectedKaPublishStatus == 'Online') {
            this.handleConfirmUpdate();
        } else {
            this.processKnowledgeUpdate();
        }
    }

    handleDeleteKa(){
        this.handleConfirmDelete();
    }

    processKnowledgeUpdate(){
        const modalCancel = this.template.querySelector('c-knowledge-modal-update')
        modalCancel.openModal();
    }

    async handleConfirmUpdate() {
        const result = await LightningConfirm.open({
            message: 'The published version will remain online until you publish this draft, Click OK to Unpublish and edit as Draft',
            theme: 'info', // more would be success, info, warning
            //variant: 'headerless',
            label: 'Edit as Draft?',
            // setting theme would have no effect
        });
        // console.log(result);
        if(result){
            this.processKnowledgeUpdate();
        } 
        // else {
        //     console.log('no click')
        // }
    }

    async handleConfirmDelete() {
        const result = await LightningConfirm.open({
            message: 'The Knowledge Article will be deleted, this action can\'t be undone.',
            theme: 'warning', // more would be success, info, warning
            label: 'Delete Knowledge Article?',
        });
        // console.log(result);
        if(result){
            console.log(this.selectedKaId);
            this.isLoading = true;
            deleteKnowledgeArticle({
                kaId: this.selectedKaId,
            })
            .then(result => {
                window.clearTimeout(this.delayTimeout);
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                this.delayTimeout = setTimeout(() => {
                    refreshApex(this.wiredKnowledgeArticlesByUser);
                    this.showNotificationDeleted();
                    this.isLoading = false;
                }, 2500);
                console.log(result);
            })
            .catch(error => {
                console.log(error);
            })
        } else {
            console.log('no click')
        }
    }

    showNotificationDeleted(){
        const event = new ShowToastEvent({
            title: 'Knowledge Article has been deleted.',
            variant: 'success'
        });
        this.dispatchEvent(event);
    }

    handleUpdateModalStatus(event){
        let statusModal = event.detail.status;
        if (statusModal == "loading") {
            // this.isloadingUpdateModal = true;
        }
        if (statusModal == "finished") {
            // this.isloadingUpdateModal = false;
            refreshApex(this.wiredKnowledgeArticlesByUser);
        }
    }
}