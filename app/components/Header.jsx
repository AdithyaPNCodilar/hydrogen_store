import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import {useAnalytics} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import LogoAsset from '~/assets/logoYellow.png'
import { ChevronDown, Home, Menu, Search, ShoppingCart, User } from 'lucide-react';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}) {
  const {shop, menu} = header;
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
            <img src={LogoAsset} alt="Logo" srcSet="" className='w-10' />
          </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} shop={shop} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  headerLogo
}) {
  const className = `header-menu-${viewport}`;

  function closeAside(event) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    <nav className={className} role="navigation">
      {headerLogo}
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={closeAside}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          <Home/>
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.filter(el =>el?.url).map((item, k) => {

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <>
            <NavLink
            className="header-menu-item relative group"
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
            {item?.items?.length>0 && 
              <>
                <ChevronDown/>
                <div className='hidden group-hover:flex flex-col items-start justify-between absolute top-full bg-[var(--theme-accent-color)] text-[var(--theme-base-color)] p-5 gap-1'>
                  {item?.items?.map((el) => {
                    let url2 =
                    el?.url.includes('myshopify.com') ||
                    el?.url.includes(publicStoreDomain) ||
                    el?.url.includes(primaryDomainUrl)
                      ? new URL(el?.url).pathname
                      : el?.url;
                    return(
                      <NavLink key={el?.id} to={url2} className=' text-nowrap '>
                      {el?.title}
                    </NavLink>
                    )
                    
                  })}
                </div>
              </>
            }
          </NavLink>
          </>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
  shop
}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      {/* <NavLink className="md:hidden block" prefetch="intent" to="/" style={activeLinkStyle} end>
        <img src={LogoAsset} className=' w-40 ' alt={shop.name} srcSet="" />
      </NavLink> */}
      <div className='flex flex-row items-center justify-center gap-x-4 '>
        <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
          <Suspense fallback="Sign in">
            <Await resolve={isLoggedIn} errorElement="Sign in">
              {(isLoggedIn) => (isLoggedIn ? 
                <User/> : 
                'Sign In'
                )}
            </Await>
          </Suspense>
        </NavLink>
        <SearchToggle />
        <CartToggle cart={cart} />
      </div>
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3><Menu/></h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button onClick={() => open('search')}>
      <Search/>
    </button>
  );
}

function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  // return (
  //   <a
  //     href="/cart"
  //     onClick={(e) => {
  //       e.preventDefault();
  //       open('cart');
  //       publish('cart_viewed', {
  //         cart,
  //         prevCart,
  //         shop,
  //         url: window.location.href || '',
  //       } as CartViewPayload);
  //     }}
  //   >
  //     Cart {count}
  //   </a>
  // );
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
      className='grid place-content-center relative'
    >
      <ShoppingCart/> 
      {count === null ? <span>&nbsp;</span> : 
      <div className=' absolute w-5 h-5 rounded-full grid place-content-center -right-2 -top-2 bg-[var(--theme-accent-color)] font-bold text-[var(--theme-base-color)]'>{count}</div>}
    </div>
  );

}

function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    // color: isPending ? 'grey' : 'black',
  };
}
