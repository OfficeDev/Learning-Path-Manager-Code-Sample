// create namespace for this project
var lpm = lpm || {};
lpm.models = lpm.models || {};

// learning path entity
lpm.models.learningPath = function () {
  this.Id = undefined;
  this.Title = undefined;
  this.ApprovedState = undefined;
  this.OData__Comments = undefined;
  this.__metadata = {
    type: 'SP.Data.LearningPathsListItem'
  };
};