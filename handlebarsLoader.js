module.exports = {
  process(src) {
    return {
      code: `
        const Handlebars = require('handlebars');
        module.exports = Handlebars.compile(\`${src}\`);
      `
    };
  },
};
