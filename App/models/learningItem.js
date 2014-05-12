// create namespace for this project
var lpm = lpm || {};
lpm.models = lpm.models || {};

// learning item entity
lpm.models.learningItem = function () {
  this.Id = undefined;
  this.Title = undefined;
  this.ItemType = undefined;
  this.LearningPathId = undefined;
  this.Url = undefined;
  this.OData__Comments = undefined;
  this.__metadata = {
    type: 'SP.Data.LearningItemsListItem'
  };
};