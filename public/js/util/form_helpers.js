module.exports = {
  validate(view, errorMessages, state) {
    Object.keys(errorMessages).forEach((field) => {
      Object.keys(errorMessages[field]).every((error) => {
        var result = errorMessages[field][error](d.qs('[name="' + field + '"]').value);
        if(result !== true) {
          state.fieldStatus[field] = result;
        }
        return result === true;
      })
    });

    view.updateState();

    return Object.keys(state.fieldStatus).every(x => !state.fieldStatus[x]);
  }
}