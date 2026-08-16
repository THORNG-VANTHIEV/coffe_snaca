/**
 * UI chrome strings only.
 *
 * Menu *content* is never translated here — products and categories carry
 * their own `_en` / `_km` fields inside `db.json` (spec §19). This dictionary
 * covers the labels around them: section headings, empty states, buttons.
 *
 * `en` is the source of truth for the shape; `km` is typed against it, so a
 * missing or misspelled key fails the build instead of rendering blank.
 */

const en = {
  common: {
    appName: 'Digital Menu',
    all: 'All',
    back: 'Back',
    close: 'Close',
    items: 'items',
    item: 'item',
    viewAll: 'View all',
    from: 'From',
    language: 'Language',
    switchToKhmer: 'ប្តូរទៅភាសាខ្មែរ',
    switchToEnglish: 'Switch to English',
    skipToContent: 'Skip to menu',
    backToTop: 'Back to top',
  },

  header: {
    table: 'Table',
    welcome: 'Welcome',
  },

  theme: {
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode',
  },

  hero: {
    titleLine1: 'Fresh Coffee.',
    titleLine2: 'Better Moments.',
    subtitle: 'Discover your favourite drink, freshly made every morning.',
    cta: 'Browse the menu',
  },

  search: {
    placeholder: 'Search coffee, tea, food…',
    label: 'Search the menu',
    clear: 'Clear search',
    resultsFor: 'Results for',
    noResultsTitle: 'Nothing matched your search',
    noResultsBody: 'Try a shorter word, or browse the categories above.',
    countOne: 'result',
    countOther: 'results',
  },

  sections: {
    categories: 'Categories',
    bestSellers: 'Best Sellers',
    recommended: 'Recommended For You',
    fullMenu: 'Full Menu',
    related: 'You May Also Like',
  },

  product: {
    sizes: 'Size',
    portion: 'Portion',
    temperature: 'Temperature',
    sugar: 'Sugar Level',
    ice: 'Ice Level',
    extras: 'Extras',
    ingredients: 'Ingredients',
    category: 'Category',
    optionsNote: 'Options are shown for reference — tell our staff what you prefer when ordering.',
    priceNote: 'Prices include tax.',
  },

  temperature: {
    hot: 'Hot',
    iced: 'Iced',
  },

  ice: {
    none: 'No Ice',
    less: 'Less Ice',
    normal: 'Normal Ice',
    extra: 'Extra Ice',
  },

  availability: {
    available: 'Available',
    unavailable: 'Temporarily Unavailable',
    unavailableShort: 'Sold out',
  },

  badges: {
    bestSeller: 'Best Seller',
    recommended: 'Recommended',
    featured: 'Featured',
  },

  states: {
    loading: 'Loading the menu',
    emptyCategoryTitle: 'No menu items available in this category.',
    emptyCategoryBody: 'Please choose another category.',
    errorTitle: 'Unable to load the menu.',
    errorBody: 'Please check your connection and refresh the page.',
    retry: 'Try again',
    notFoundTitle: 'We could not find that page',
    notFoundBody: 'The link may be out of date.',
    productNotFoundTitle: 'This item is no longer on the menu',
    productNotFoundBody: 'Browse the full menu to find something else.',
    backToMenu: 'Back to the menu',
  },

  nav: {
    home: 'Home',
    menu: 'Menu',
    about: 'About',
  },

  about: {
    title: 'About us',
    intro:
      'A neighbourhood coffee shop serving freshly roasted beans, Khmer home cooking and a quiet place to sit.',
    visit: 'Visit us',
    contact: 'Contact',
    hours: 'Opening hours',
    follow: 'Follow us',
    menuNote: 'This menu is for viewing only. Please order at the counter or ask our staff.',
  },

  footer: {
    hours: 'Open daily',
    address: 'Address',
    phone: 'Phone',
    follow: 'Follow us',
    rights: 'All rights reserved.',
  },
} as const

type Dictionary = {
  readonly [Section in keyof typeof en]: {
    readonly [Key in keyof (typeof en)[Section]]: string
  }
}

const km: Dictionary = {
  common: {
    appName: 'ម៉ឺនុយឌីជីថល',
    all: 'ទាំងអស់',
    back: 'ត្រឡប់ក្រោយ',
    close: 'បិទ',
    items: 'មុខ',
    item: 'មុខ',
    viewAll: 'មើលទាំងអស់',
    from: 'ចាប់ពី',
    language: 'ភាសា',
    switchToKhmer: 'ប្តូរទៅភាសាខ្មែរ',
    switchToEnglish: 'Switch to English',
    skipToContent: 'រំលងទៅម៉ឺនុយ',
    backToTop: 'ឡើងទៅលើ',
  },

  header: {
    table: 'តុលេខ',
    welcome: 'សូមស្វាគមន៍',
  },

  theme: {
    toDark: 'ប្តូរទៅរូបរាងងងឹត',
    toLight: 'ប្តូរទៅរូបរាងភ្លឺ',
  },

  hero: {
    titleLine1: 'កាហ្វេស្រស់',
    titleLine2: 'សម្រាប់ពេលវេលាដ៏ល្អរបស់អ្នក',
    subtitle: 'ស្វែងរកភេសជ្ជៈដែលអ្នកចូលចិត្ត ធ្វើថ្មីៗរាល់ព្រឹក។',
    cta: 'មើលម៉ឺនុយ',
  },

  search: {
    placeholder: 'ស្វែងរក កាហ្វេ តែ ម្ហូប…',
    label: 'ស្វែងរកក្នុងម៉ឺនុយ',
    clear: 'សម្អាតការស្វែងរក',
    resultsFor: 'លទ្ធផលសម្រាប់',
    noResultsTitle: 'រកមិនឃើញលទ្ធផលទេ',
    noResultsBody: 'សូមសាកល្បងពាក្យខ្លីជាង ឬជ្រើសរើសតាមប្រភេទខាងលើ។',
    countOne: 'លទ្ធផល',
    countOther: 'លទ្ធផល',
  },

  sections: {
    categories: 'ប្រភេទ',
    bestSellers: 'លក់ដាច់បំផុត',
    recommended: 'ណែនាំសម្រាប់អ្នក',
    fullMenu: 'ម៉ឺនុយទាំងអស់',
    related: 'អ្នកអាចនឹងចូលចិត្ត',
  },

  product: {
    sizes: 'ទំហំ',
    portion: 'ចំណែក',
    temperature: 'សីតុណ្ហភាព',
    sugar: 'កម្រិតស្ករ',
    ice: 'កម្រិតទឹកកក',
    extras: 'ជម្រើសបន្ថែម',
    ingredients: 'គ្រឿងផ្សំ',
    category: 'ប្រភេទ',
    optionsNote: 'ជម្រើសទាំងនេះសម្រាប់ជាព័ត៌មានប៉ុណ្ណោះ សូមប្រាប់បុគ្គលិកនៅពេលកម្មង់។',
    priceNote: 'តម្លៃរួមបញ្ចូលពន្ធរួចហើយ។',
  },

  temperature: {
    hot: 'ក្តៅ',
    iced: 'ទឹកកក',
  },

  ice: {
    none: 'គ្មានទឹកកក',
    less: 'ទឹកកកតិច',
    normal: 'ទឹកកកធម្មតា',
    extra: 'ទឹកកកច្រើន',
  },

  availability: {
    available: 'មាន',
    unavailable: 'អស់ជាបណ្តោះអាសន្ន',
    unavailableShort: 'អស់ស្តុក',
  },

  badges: {
    bestSeller: 'លក់ដាច់',
    recommended: 'ណែនាំ',
    featured: 'ពិសេស',
  },

  states: {
    loading: 'កំពុងផ្ទុកម៉ឺនុយ',
    emptyCategoryTitle: 'មិនទាន់មានមុខម្ហូបនៅក្នុងប្រភេទនេះទេ។',
    emptyCategoryBody: 'សូមជ្រើសរើសប្រភេទផ្សេងទៀត។',
    errorTitle: 'មិនអាចទាញយកម៉ឺនុយបានទេ។',
    errorBody: 'សូមពិនិត្យអ៊ីនធឺណិត រួចផ្ទុកទំព័រឡើងវិញ។',
    retry: 'ព្យាយាមម្តងទៀត',
    notFoundTitle: 'រកមិនឃើញទំព័រនេះទេ',
    notFoundBody: 'តំណភ្ជាប់នេះអាចហួសសម័យហើយ។',
    productNotFoundTitle: 'មុខទំនិញនេះលែងមាននៅក្នុងម៉ឺនុយ',
    productNotFoundBody: 'សូមមើលម៉ឺនុយទាំងអស់ដើម្បីជ្រើសរើសមុខផ្សេង។',
    backToMenu: 'ត្រឡប់ទៅម៉ឺនុយ',
  },

  nav: {
    home: 'ទំព័រដើម',
    menu: 'ម៉ឺនុយ',
    about: 'អំពីយើង',
  },

  about: {
    title: 'អំពីយើង',
    intro:
      'ហាងកាហ្វេក្នុងសង្កាត់ ដែលផ្តល់ជូនកាហ្វេលីងថ្មីៗ ម្ហូបខ្មែរ និងកន្លែងអង្គុយស្ងប់ស្ងាត់។',
    visit: 'អញ្ជើញមកលេង',
    contact: 'ទំនាក់ទំនង',
    hours: 'ម៉ោងបើកទ្វារ',
    follow: 'តាមដានយើងខ្ញុំ',
    menuNote: 'ម៉ឺនុយនេះសម្រាប់មើលប៉ុណ្ណោះ។ សូមកម្មង់នៅបញ្ជរ ឬសួរបុគ្គលិក។',
  },

  footer: {
    hours: 'បើកជារៀងរាល់ថ្ងៃ',
    address: 'អាសយដ្ឋាន',
    phone: 'ទូរស័ព្ទ',
    follow: 'តាមដានយើងខ្ញុំ',
    rights: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។',
  },
}

export type Strings = Dictionary

export const dictionaries: Record<'en' | 'km', Strings> = { en, km }
