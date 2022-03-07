const langs = {
  javascript: { ext: ".js", abbr: "js", default: "console.log('hello world')" },
  typescript: { ext: ".ts", abbr: "ts", default: "console.log('hello world')" },
  csharp: {
    ext: ".cs",
    abbr: "cs",
    default: `using System;

  class Hello
  {
      static void Main()
      {
          Console.WriteLine("Hello, World");
      }
  }`,
  },
  java: {
    ext: ".java",
    abbr: "java",
    default: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!"); 
    }
}`,
  },
  python: { ext: ".py", abbr: "py", default: "print('hello world')" },
};

function getLangExt(language) {
  return langs[language].ext;
}

function getLang(ext) {
  for (let lang in langs) {
    if (langs[lang].ext == ext) {
      return lang;
    }
  }

  return false;
}

function getAbbr(language) {
  return langs[language].abbr;
}

function parsePid(param) {
  let res = param.split("-");
  res[0] = getLang("." + res[0]);
  return res;
}

function checkLanguage(lang) {
  return Object.keys(langs).includes(lang);
}

function getDefaultCode(lang) {
  return langs[lang].default;
}

module.exports = {
  getAbbr,
  getLang,
  getLangExt,
  parsePid,
  checkLanguage,
  getDefaultCode
};
