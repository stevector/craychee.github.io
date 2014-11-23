<?php
namespace Craychee\Twig\Extensions;

use Twig_Environment;
use Twig_Extension;
use Twig_Filter_Method;
use Twig_SimpleFunction;

class Text extends Twig_Extension
{
    public function getFilters()
    {
        $filters = array(
            'compact' => new Twig_Filter_Method($this, 'compactFilter'),
        );

        return $filters;
    }

    public function getFunctions()
    {
        $functions = array(
            new Twig_SimpleFunction('lunr', array($this, 'lunrGenerator'), array('needs_environment' => true)),
        );

        return $functions;
    }

    public function getName()
    {
        return 'CraycheeShellText';
    }

    public function compactFilter($string)
    {
        return trim(preg_replace('!\s+!isU', ' ', $string));
    }

    public function lunrGenerator(Twig_Environment $env, $posts)
    {
        $data = array('entries' => array());
        foreach ($posts as $post) {
            $meta = $post->meta();
            if (isset($meta['exclude_from_search'])) {
                return $post->title;
            }
            $blocks = $post->blocks();
            if (isset($blocks['content'])) {
                $content = $this->compactFilter(strip_tags($blocks['content']));
            } else {
                $content = '';
            }
            if (isset($meta['description'])) {
                $description = $meta['description'];
            } else {
                $description = twig_truncate_filter($env, $content, 140);
            }
            $data['entries'][] = array(
                'title' => $this->compactFilter(strip_tags($post->title())),
                'url' => $post->url(),
                'date' => date('Y-m-d H:i:s O', $post->date()),
                'body' => $content,
                'description' => $description,
            );
        }
        return json_encode($data);
    }
}
